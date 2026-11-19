/**
 * Google Drive → DB sync service (orchestrator).
 *
 * Rules:
 *  - Chỉ import bài review_state=approved từ manifest
 *  - Không bao giờ ghi đè row có origin='admin' → báo conflict
 *  - Tính conflict closure: source/segment đang được bài admin tham chiếu cũng không bị ghi đè
 *  - 2-Pha: Pha 1 tải + parse + validate toàn bộ file; Pha 2 mới ghi DB
 *  - Lỗi mạng/quota Drive: dừng sync ngay lập tức, không ghi nửa chừng
 *  - Nạp và validate questions_file thật cho bài listening, ghi vào cột activities.questions
 *  - Chặn phụ thuộc: segment lỗi/xung đột → activity tham chiếu bị loại bỏ và báo lỗi
 *  - Dry-run (mặc định): parse + validate nhưng không write DB
 *  - Thống kê skipped đầy đủ cho các bản ghi không approved
 *
 * Modules: ./drive-sync/{types,drive-files,manifest-checks,conflicts,
 * stage-segments,stage-activities,apply}
 */
import {
  getDriveClient,
  getDriveFolderId,
  downloadFileText,
} from "../providers/google-drive";
import { parseManifestYaml } from "../seed/manifest-parser";
import { indexDriveFolder, buildDriveFileReader, type FolderIndex } from "./drive-sync/drive-files";
import { collectSkippedIds, validateApprovedActivities } from "./drive-sync/manifest-checks";
import { computeConflictClosure } from "./drive-sync/conflicts";
import { stageNeededSources, stageNeededSegments } from "./drive-sync/stage-segments";
import { stageApprovedActivities } from "./drive-sync/stage-activities";
import { applyStagedRows } from "./drive-sync/apply";
import { emptySyncResult, type SyncResult } from "./drive-sync/types";

export type { SyncConflict, SyncError, SyncResult } from "./drive-sync/types";

const errMsg = (err: unknown) => (err instanceof Error ? err.message : String(err));

export async function syncDriveContent(opts: {
  dryRun?: boolean;
}): Promise<SyncResult> {
  const { dryRun = true } = opts;
  const result = emptySyncResult(dryRun);

  // ── 1. Init Drive client + folder ID ──
  let drive: ReturnType<typeof getDriveClient>;
  let rootFolderId: string;
  try {
    drive = getDriveClient();
    rootFolderId = getDriveFolderId();
  } catch (err) {
    result.errors.push({ message: `Lỗi khởi tạo Drive client: ${errMsg(err)}` });
    return result;
  }

  // ── 2. Index folder structure ──
  let folderIndex: FolderIndex;
  const structureWarnings: string[] = [];
  try {
    const { index, structureErrors } = await indexDriveFolder(drive, rootFolderId);
    if (structureErrors.length > 0) {
      for (const e of structureErrors) result.errors.push({ message: e });
      return result;
    }
    folderIndex = index;
  } catch (err) {
    result.errors.push({
      message: `Lỗi khi kiểm tra cấu trúc thư mục Drive: ${errMsg(err)}`,
    });
    return result;
  }

  // ── 3. Download manifest.yaml ──
  let manifestContent: string | null;
  try {
    manifestContent = await downloadFileText(drive, folderIndex.manifestFile!.id);
    if (!manifestContent) {
      result.errors.push({
        file: "manifest.yaml",
        message: "Không thể tải manifest.yaml từ Drive.",
      });
      return result;
    }
  } catch (err) {
    result.errors.push({
      file: "manifest.yaml",
      message: `Lỗi tải manifest.yaml: ${errMsg(err)}`,
    });
    return result;
  }

  // ── 4. Parse manifest YAML ──
  const parseResult = parseManifestYaml(manifestContent);
  if (!parseResult.success) {
    for (const e of parseResult.errors) {
      result.errors.push({ file: "manifest.yaml", message: e });
    }
    return result;
  }
  const { data } = parseResult;

  // ── 5. Thống kê skipped (draft / unapproved) ──
  result.skipped.push(...collectSkippedIds(data));

  // ── 6. Validate approved activities (topic, segment refs) ──
  const { approvedActivities, validationErrors } = validateApprovedActivities(data);
  if (validationErrors.length > 0) {
    for (const e of validationErrors) {
      result.errors.push({ file: "manifest.yaml", message: e });
    }
    return result;
  }

  const approvedSources = (data.sources ?? []).filter(
    (s) => s.review_state === "approved"
  );
  if (approvedActivities.length === 0 && approvedSources.length === 0) {
    return result;
  }

  // ── 7. Conflict closure (origin='admin' + quan hệ admin tham chiếu) ──
  let closure: Awaited<ReturnType<typeof computeConflictClosure>>;
  try {
    closure = await computeConflictClosure(data, approvedActivities);
    result.conflicts.push(...closure.conflicts);
  } catch (err) {
    result.errors.push({ message: `Lỗi đọc DB: ${errMsg(err)}` });
    return result;
  }
  const { origins, blocked } = closure;

  // ── 8. Collect needed sources & segments ──
  const allSegments = data.segments ?? [];
  const allSources = data.sources ?? [];
  const segmentMap = new Map(allSegments.map((s) => [s.id, s]));
  const sourceMap = new Map(allSources.map((s) => [s.id, s]));

  const neededSegmentIds = new Set<string>();
  const neededSourceIds = new Set<string>();
  for (const act of approvedActivities) {
    if (act.segment_ids) {
      for (const segId of act.segment_ids) {
        const seg = segmentMap.get(segId);
        if (seg) {
          neededSegmentIds.add(segId);
          neededSourceIds.add(seg.source_id);
        }
      }
    }
  }
  for (const src of approvedSources) {
    neededSourceIds.add(src.id);
  }

  // ══ PHA 1: TẢI + PARSE + VALIDATE TOÀN BỘ (KHÔNG GHI DB) ══
  const readFile = buildDriveFileReader(drive, folderIndex, structureWarnings);

  const srcStage = stageNeededSources(neededSourceIds, sourceMap, blocked.blockedSourceIds);
  result.errors.push(...srcStage.errors);

  const segStage = await stageNeededSegments(
    neededSegmentIds,
    segmentMap,
    blocked,
    readFile
  );
  result.errors.push(...segStage.errors);
  if (segStage.fatalError) {
    result.errors.push(segStage.fatalError);
    return result;
  }

  const actStage = await stageApprovedActivities(
    approvedActivities,
    blocked,
    segStage.failedSegmentIds,
    readFile
  );
  result.errors.push(...actStage.errors);
  if (actStage.fatalError) {
    result.errors.push(actStage.fatalError);
    return result;
  }

  // ══ PHA 2: GHI VÀO DB (CHỈ KHI !dryRun) ══
  await applyStagedRows(
    {
      sources: srcStage.staged,
      segments: segStage.staged,
      activities: actStage.staged,
    },
    origins,
    dryRun,
    result
  );

  // Thêm structural warnings (non-fatal)
  for (const w of structureWarnings) {
    result.errors.push({ message: `[warning] ${w}` });
  }

  return result;
}
