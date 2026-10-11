/**
 * Google Drive → DB sync service.
 *
 * Rules:
 *  - Chỉ import bài review_state=approved từ manifest
 *  - Không bao giờ ghi đè row có origin='admin' → báo conflict
 *  - Tính conflict closure: source/segment đang được bài admin tham chiếu cũng không bị ghi đè
 *  - 2-Pha: Pha 1 tải + parse + validate toàn bộ file; Pha 2 mới ghi DB
 *  - Lỗi mạng/quota Drive: dừng sync ngay lập tức, không ghi nửa chừng
 *  - Nạp và validate questions_file thật cho bài listening, ghi vào cột activities.questions
 *  - Chặn phụ thuộc: segment lỗi/xung đột → activity tham chiếu bị loại bỏ và báo lỗi
 *  - Dry-run: parse + validate nhưng không write DB
 *  - Thống kê skipped đầy đủ cho các bản ghi không approved
 */

import yaml from "yaml";
import { inArray, eq } from "drizzle-orm";
import { db } from "../../db";
import { activities, sources, sourceSegments } from "../../db/schema";
import {
  getDriveClient,
  getDriveFolderId,
  listFolderContents,
  downloadFileText,
  findFileByName,
  findSubFolderId,
  type DriveFile,
  DriveNetworkOrQuotaError,
} from "../providers/google-drive";
import {
  parseManifestYaml,
  type ManifestData,
  type ManifestActivity,
} from "../seed/manifest-parser";
import { isValidTopicKey, UNCATEGORIZED_TOPIC } from "../../lib/topics";
import { validateListeningQuestions } from "../../lib/listening-questions";

// ──────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────

export interface SyncConflict {
  id: string;
  kind: "activity" | "source" | "segment";
  reason: string;
}

export interface SyncError {
  file?: string;
  id?: string;
  message: string;
}

export interface SyncResult {
  added: string[];
  updated: string[];
  skipped: string[];
  conflicts: SyncConflict[];
  errors: SyncError[];
  dryRun: boolean;
}

// ──────────────────────────────────────────────
// Internal: Drive file cache (per sync session)
// ──────────────────────────────────────────────

interface FolderIndex {
  manifestFile: DriveFile | null;
  textsFolderId: string | null;
  transcriptsFolderId: string | null;
  rubricsFolderId: string | null;
}

async function indexDriveFolder(
  drive: ReturnType<typeof getDriveClient>,
  rootFolderId: string
): Promise<{ index: FolderIndex; structureErrors: string[] }> {
  const structureErrors: string[] = [];

  const rootItems = await listFolderContents(drive, rootFolderId);

  const manifestFile =
    rootItems.find(
      (f) =>
        f.name === "manifest.yaml" &&
        f.mimeType !== "application/vnd.google-apps.folder"
    ) ?? null;

  if (!manifestFile) {
    structureErrors.push(
      "Không tìm thấy manifest.yaml ở gốc thư mục Drive. Kiểm tra lại cấu trúc thư mục."
    );
  }

  const textsFolderId = await findSubFolderId(drive, rootFolderId, "texts");
  const transcriptsFolderId = await findSubFolderId(
    drive,
    rootFolderId,
    "transcripts"
  );
  const rubricsFolderId = await findSubFolderId(drive, rootFolderId, "rubrics");

  if (!textsFolderId) {
    structureErrors.push(
      "Không tìm thấy thư mục con texts/ trong thư mục Drive."
    );
  }
  if (!transcriptsFolderId) {
    structureErrors.push(
      "Không tìm thấy thư mục con transcripts/ trong thư mục Drive."
    );
  }

  return {
    index: {
      manifestFile,
      textsFolderId,
      transcriptsFolderId,
      rubricsFolderId,
    },
    structureErrors,
  };
}

function buildDriveFileReader(
  drive: ReturnType<typeof getDriveClient>,
  folderIndex: FolderIndex,
  warnings: string[]
) {
  const cache = new Map<string, string | null>();

  return async (relativePath: string): Promise<string | null> => {
    if (cache.has(relativePath)) return cache.get(relativePath)!;

    const parts = relativePath.replace(/\\/g, "/").split("/");
    if (parts.length !== 2) {
      warnings.push(
        `Đường dẫn "${relativePath}" không đúng cấu trúc (phải là "subfolder/filename"). Bỏ qua.`
      );
      cache.set(relativePath, null);
      return null;
    }

    const [subfolderName, fileName] = parts;
    let parentFolderId: string | null = null;

    switch (subfolderName) {
      case "texts":
        parentFolderId = folderIndex.textsFolderId;
        break;
      case "transcripts":
        parentFolderId = folderIndex.transcriptsFolderId;
        break;
      case "rubrics":
        parentFolderId = folderIndex.rubricsFolderId;
        break;
      default:
        warnings.push(
          `Thư mục "${subfolderName}" không được hỗ trợ (chỉ texts/ transcripts/ rubrics/). Bỏ qua.`
        );
        cache.set(relativePath, null);
        return null;
    }

    if (!parentFolderId) {
      cache.set(relativePath, null);
      return null;
    }

    const file = await findFileByName(drive, parentFolderId, fileName);
    if (!file) {
      cache.set(relativePath, null);
      return null;
    }

    const content = await downloadFileText(drive, file.id);
    cache.set(relativePath, content);
    return content;
  };
}

// ──────────────────────────────────────────────
// Validation helpers
// ──────────────────────────────────────────────

function validateApprovedActivities(
  data: ManifestData
): { approvedActivities: ManifestActivity[]; validationErrors: string[] } {
  const allActivities = data.activities ?? [];
  const allSegments = data.segments ?? [];
  const segmentMap = new Map(allSegments.map((s) => [s.id, s]));

  const approvedActivities = allActivities.filter(
    (act) => act.review_state === "approved"
  );
  const validationErrors: string[] = [];

  for (const act of approvedActivities) {
    if (act.topic !== undefined && act.topic !== null) {
      const topicKey = String(act.topic).trim();
      if (
        topicKey !== "" &&
        (!isValidTopicKey(topicKey) || topicKey === UNCATEGORIZED_TOPIC)
      ) {
        validationErrors.push(
          `Activity "${act.id}" ("${act.title}") có topic không hợp lệ: "${topicKey}"`
        );
      }
    }

    if (act.segment_ids && Array.isArray(act.segment_ids)) {
      for (const segId of act.segment_ids) {
        if (!segmentMap.has(segId)) {
          validationErrors.push(
            `Activity "${act.id}" tham chiếu segment không tồn tại trong manifest: "${segId}"`
          );
        }
      }
    }
  }

  return { approvedActivities, validationErrors };
}

// ──────────────────────────────────────────────
// DB helpers: check existing origin & closure
// ──────────────────────────────────────────────

async function getExistingOrigins(): Promise<{
  activityOrigins: Map<string, string>;
  sourceOrigins: Map<string, string>;
  segmentOrigins: Map<string, string>;
}> {
  const [existingActivities, existingSources, existingSegments] =
    await Promise.all([
      db.select({ id: activities.id, origin: activities.origin }).from(activities),
      db.select({ id: sources.id, origin: sources.origin }).from(sources),
      db
        .select({ id: sourceSegments.id, origin: sourceSegments.origin })
        .from(sourceSegments),
    ]);

  return {
    activityOrigins: new Map(
      existingActivities.map((a) => [a.id, a.origin ?? "seed"])
    ),
    sourceOrigins: new Map(
      existingSources.map((s) => [s.id, s.origin ?? "seed"])
    ),
    segmentOrigins: new Map(
      existingSegments.map((s) => [s.id, s.origin ?? "seed"])
    ),
  };
}

// ──────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────

export async function syncDriveContent(opts: {
  dryRun?: boolean;
}): Promise<SyncResult> {
  const { dryRun = false } = opts;

  const result: SyncResult = {
    added: [],
    updated: [],
    skipped: [],
    conflicts: [],
    errors: [],
    dryRun,
  };

  // ── 1. Init Drive client + folder ID ──
  let drive: ReturnType<typeof getDriveClient>;
  let rootFolderId: string;
  try {
    drive = getDriveClient();
    rootFolderId = getDriveFolderId();
  } catch (err) {
    result.errors.push({
      message: `Lỗi khởi tạo Drive client: ${err instanceof Error ? err.message : String(err)}`,
    });
    return result;
  }

  // ── 2. Index folder structure ──
  let folderIndex: FolderIndex;
  const structureWarnings: string[] = [];
  try {
    const { index, structureErrors } = await indexDriveFolder(
      drive,
      rootFolderId
    );
    if (structureErrors.length > 0) {
      for (const e of structureErrors) {
        result.errors.push({ message: e });
      }
      return result;
    }
    folderIndex = index;
  } catch (err) {
    result.errors.push({
      message: `Lỗi khi kiểm tra cấu trúc thư mục Drive: ${err instanceof Error ? err.message : String(err)}`,
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
      message: `Lỗi tải manifest.yaml: ${err instanceof Error ? err.message : String(err)}`,
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

  // ── 5. Thống kê skipped từ manifest (draft / unapproved) ──
  for (const act of data.activities ?? []) {
    if (act.review_state !== "approved") {
      result.skipped.push(`activity:${act.id}`);
    }
  }
  for (const src of data.sources ?? []) {
    if (src.review_state !== "approved") {
      result.skipped.push(`source:${src.id}`);
    }
  }

  // ── 6. Validate approved activities ──
  const { approvedActivities, validationErrors } =
    validateApprovedActivities(data);

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

  // ── 7. Build Drive file reader ──
  const driveFileReader = buildDriveFileReader(
    drive,
    folderIndex,
    structureWarnings
  );

  // ── 8. Check existing origins & compute conflict closure ──
  let activityOrigins: Map<string, string>;
  let sourceOrigins: Map<string, string>;
  let segmentOrigins: Map<string, string>;
  const blockedActivityIds = new Set<string>();
  const blockedSegmentIds = new Set<string>();
  const blockedSourceIds = new Set<string>();

  try {
    ({ activityOrigins, sourceOrigins, segmentOrigins } =
      await getExistingOrigins());

    // 8.1. Lấy tất cả activities có origin='admin' trong DB để tính quan hệ closure
    const adminActivitiesInDb = await db
      .select({ id: activities.id, segmentIds: activities.segmentIds })
      .from(activities)
      .where(eq(activities.origin, "admin"));

    const adminUsedSegmentIds = new Set<string>();
    for (const a of adminActivitiesInDb) {
      if (Array.isArray(a.segmentIds)) {
        for (const sId of a.segmentIds) {
          if (sId) adminUsedSegmentIds.add(sId);
        }
      }
    }

    const adminUsedSourceIds = new Set<string>();
    if (adminUsedSegmentIds.size > 0) {
      const segRows = await db
        .select({ sourceId: sourceSegments.sourceId })
        .from(sourceSegments)
        .where(inArray(sourceSegments.id, Array.from(adminUsedSegmentIds)));
      for (const r of segRows) {
        if (r.sourceId) adminUsedSourceIds.add(r.sourceId);
      }
    }

    // 8.2. Conflicts cho Sources
    for (const src of data.sources ?? []) {
      const isDirectAdmin = sourceOrigins.get(src.id) === "admin";
      const isReferencedByAdminAct = adminUsedSourceIds.has(src.id);

      if (isDirectAdmin || isReferencedByAdminAct) {
        blockedSourceIds.add(src.id);
        result.conflicts.push({
          id: src.id,
          kind: "source",
          reason: isDirectAdmin
            ? `Source "${src.id}" được quản lý bởi admin (origin=admin). Drive sync không được ghi đè.`
            : `Source "${src.id}" đang được bài học của admin tham chiếu. Drive sync không được ghi đè.`,
        });
      }
    }

    // 8.3. Conflicts cho Segments
    for (const seg of data.segments ?? []) {
      const isDirectAdmin = segmentOrigins.get(seg.id) === "admin";
      const isReferencedByAdminAct = adminUsedSegmentIds.has(seg.id);
      const isParentSourceBlocked = blockedSourceIds.has(seg.source_id);

      if (isDirectAdmin || isReferencedByAdminAct) {
        blockedSegmentIds.add(seg.id);
        result.conflicts.push({
          id: seg.id,
          kind: "segment",
          reason: isDirectAdmin
            ? `Segment "${seg.id}" được quản lý bởi admin (origin=admin). Drive sync không được ghi đè.`
            : `Segment "${seg.id}" đang được bài học của admin tham chiếu. Drive sync không được ghi đè.`,
        });
      } else if (isParentSourceBlocked) {
        blockedSegmentIds.add(seg.id);
      }
    }

    // 8.4. Conflicts cho Activities
    for (const act of approvedActivities) {
      if (activityOrigins.get(act.id) === "admin") {
        blockedActivityIds.add(act.id);
        result.conflicts.push({
          id: act.id,
          kind: "activity",
          reason: `Activity "${act.id}" ("${act.title}") được quản lý bởi admin (origin=admin). Drive sync không được ghi đè.`,
        });
      }
    }
  } catch (err) {
    result.errors.push({
      message: `Lỗi đọc DB: ${err instanceof Error ? err.message : String(err)}`,
    });
    return result;
  }

  // ── 9. Collect needed sources & segments ──
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

  // ══════════════════════════════════════════════
  // PHA 1: TẢI + PARSE + VALIDATE TOÀN BỘ (KHÔNG GHI DB)
  // ══════════════════════════════════════════════

  // 1. Stage Sources
  const stagedSources: typeof sources.$inferInsert[] = [];
  for (const sourceId of neededSourceIds) {
    if (blockedSourceIds.has(sourceId)) continue;

    const src = sourceMap.get(sourceId);
    if (!src) {
      result.errors.push({
        id: sourceId,
        message: `Source "${sourceId}" được tham chiếu trong segment nhưng không có trong manifest.`,
      });
      continue;
    }

    stagedSources.push({
      id: src.id,
      title: src.title,
      kind: src.kind,
      permission: src.permission ?? null,
      locatorType: src.locator_type ?? null,
      url: src.url ?? null,
      reviewState: src.review_state,
      notes: src.notes ?? null,
      origin: "drive",
    });
  }

  // 2. Stage Segments
  const stagedSegments: typeof sourceSegments.$inferInsert[] = [];
  const failedSegmentIds = new Set<string>();

  for (const segId of neededSegmentIds) {
    if (blockedSegmentIds.has(segId)) continue;

    const seg = segmentMap.get(segId);
    if (!seg) continue;

    // Nếu source của segment bị block hoặc không được nạp
    if (blockedSourceIds.has(seg.source_id)) {
      failedSegmentIds.add(segId);
      continue;
    }

    let textContent: string | null = null;
    let transcriptContent: string | null = null;

    if (seg.text_file) {
      try {
        textContent = await driveFileReader(seg.text_file);
        if (textContent === null) {
          result.errors.push({
            id: segId,
            file: seg.text_file,
            message: `Segment "${segId}" thiếu file văn bản: ${seg.text_file}`,
          });
          failedSegmentIds.add(segId);
          continue;
        }
      } catch (err) {
        if (err instanceof DriveNetworkOrQuotaError) {
          result.errors.push({
            id: segId,
            file: seg.text_file,
            message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
          });
          return result; // Lỗi mạng/quota -> dừng ngay, không ghi gì vào DB
        }
        result.errors.push({
          id: segId,
          file: seg.text_file,
          message: `Lỗi tải file ${seg.text_file}: ${err instanceof Error ? err.message : String(err)}`,
        });
        failedSegmentIds.add(segId);
        continue;
      }
    }

    if (seg.transcript_file) {
      try {
        transcriptContent = await driveFileReader(seg.transcript_file);
        if (transcriptContent === null) {
          result.errors.push({
            id: segId,
            file: seg.transcript_file,
            message: `Segment "${segId}" thiếu file transcript: ${seg.transcript_file}`,
          });
          failedSegmentIds.add(segId);
          continue;
        }
      } catch (err) {
        if (err instanceof DriveNetworkOrQuotaError) {
          result.errors.push({
            id: segId,
            file: seg.transcript_file,
            message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
          });
          return result;
        }
        result.errors.push({
          id: segId,
          file: seg.transcript_file,
          message: `Lỗi tải file ${seg.transcript_file}: ${err instanceof Error ? err.message : String(err)}`,
        });
        failedSegmentIds.add(segId);
        continue;
      }
    }

    stagedSegments.push({
      id: seg.id,
      sourceId: seg.source_id,
      page: seg.page ?? null,
      startSeconds: seg.start_seconds ?? null,
      endSeconds: seg.end_seconds ?? null,
      textContent,
      transcriptContent,
      verifiedTranscript: seg.verified_transcript ?? false,
      language: seg.language ?? "en",
      origin: "drive",
    });
  }

  // 3. Stage Activities
  const stagedActivities: (typeof activities.$inferInsert & { questions?: unknown })[] = [];

  for (const act of approvedActivities) {
    if (blockedActivityIds.has(act.id)) continue;

    // Chặn phụ thuộc: nếu có segment nào bị lỗi tải file hoặc xung đột -> activity bị loại bỏ
    if (act.segment_ids && Array.isArray(act.segment_ids)) {
      const brokenSeg = act.segment_ids.find(
        (sid) => failedSegmentIds.has(sid) || blockedSegmentIds.has(sid)
      );
      if (brokenSeg) {
        result.errors.push({
          id: act.id,
          message: `Activity "${act.id}" tham chiếu segment "${brokenSeg}" bị lỗi tải file hoặc xung đột. Bỏ qua không nạp activity này.`,
        });
        continue;
      }
    }

    // Tải prompt_file
    let promptText: string | null = null;
    if (act.prompt_file) {
      try {
        promptText = await driveFileReader(act.prompt_file);
        if (promptText === null) {
          result.errors.push({
            id: act.id,
            file: act.prompt_file,
            message: `Activity "${act.id}" thiếu file đề bài: ${act.prompt_file}`,
          });
          continue;
        }
      } catch (err) {
        if (err instanceof DriveNetworkOrQuotaError) {
          result.errors.push({
            id: act.id,
            file: act.prompt_file,
            message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
          });
          return result;
        }
        result.errors.push({
          id: act.id,
          file: act.prompt_file,
          message: `Lỗi tải ${act.prompt_file}: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    // Tải rubric_file
    let rubricJson: unknown = null;
    if (act.rubric_file) {
      try {
        const rubricContent = await driveFileReader(act.rubric_file);
        if (rubricContent === null) {
          result.errors.push({
            id: act.id,
            file: act.rubric_file,
            message: `Activity "${act.id}" thiếu file rubric: ${act.rubric_file}`,
          });
          continue;
        }
        rubricJson = yaml.parse(rubricContent);
      } catch (err) {
        if (err instanceof DriveNetworkOrQuotaError) {
          result.errors.push({
            id: act.id,
            file: act.rubric_file,
            message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
          });
          return result;
        }
        result.errors.push({
          id: act.id,
          file: act.rubric_file,
          message: `Lỗi tải/parse ${act.rubric_file}: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    // Tải questions_file cho listening activity
    let questionsJson: unknown = null;
    if (act.mode === "listening") {
      if (!act.questions_file) {
        result.errors.push({
          id: act.id,
          message: `Activity nghe "${act.id}" bắt buộc phải khai báo questions_file trong manifest.`,
        });
        continue;
      }

      try {
        const questionsContent = await driveFileReader(act.questions_file);
        if (questionsContent === null) {
          result.errors.push({
            id: act.id,
            file: act.questions_file,
            message: `Activity "${act.id}" thiếu file câu hỏi nghe: ${act.questions_file}`,
          });
          continue;
        }

        const parsedQuestions = yaml.parse(questionsContent);
        const rawList = Array.isArray(parsedQuestions)
          ? parsedQuestions
          : parsedQuestions?.questions;

        const val = validateListeningQuestions(rawList);
        if (!val.ok) {
          result.errors.push({
            id: act.id,
            file: act.questions_file,
            message: `File câu hỏi nghe "${act.questions_file}" không hợp lệ: ${val.errors.join("; ")}`,
          });
          continue;
        }

        questionsJson = val.value;
      } catch (err) {
        if (err instanceof DriveNetworkOrQuotaError) {
          result.errors.push({
            id: act.id,
            file: act.questions_file,
            message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
          });
          return result;
        }
        result.errors.push({
          id: act.id,
          file: act.questions_file,
          message: `Lỗi tải/parse ${act.questions_file}: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    stagedActivities.push({
      id: act.id,
      slot: act.slot ?? null,
      mode: act.mode,
      title: act.title,
      objective: act.objective ?? null,
      durationMinutes: act.duration_minutes ?? null,
      difficulty: act.difficulty ?? ("trial" as const),
      promptText,
      feedbackGuide: act.feedback_guide ?? null,
      rubricJson,
      answerReveal: act.answer_reveal ?? ("none" as const),
      purpose: act.purpose ?? null,
      reviewState: act.review_state,
      segmentIds: act.segment_ids ?? [],
      questionsFile: act.questions_file ?? null,
      questions: questionsJson,
      output: act.output ?? null,
      topic: act.topic ? String(act.topic).trim() || null : null,
      origin: "drive",
    });
  }

  // ══════════════════════════════════════════════
  // PHA 2: GHI VÀO DB (CHỈ KHI !dryRun)
  // ══════════════════════════════════════════════

  // Ghi Sources
  for (const src of stagedSources) {
    if (!dryRun) {
      try {
        await db
          .insert(sources)
          .values(src)
          .onConflictDoUpdate({
            target: sources.id,
            set: {
              title: src.title,
              kind: src.kind,
              permission: src.permission,
              locatorType: src.locatorType,
              url: src.url,
              reviewState: src.reviewState,
              notes: src.notes,
              origin: "drive",
            },
          });
      } catch (err) {
        result.errors.push({
          id: src.id,
          message: `Lỗi upsert source: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    if (sourceOrigins.has(src.id)) {
      result.updated.push(`source:${src.id}`);
    } else {
      result.added.push(`source:${src.id}`);
    }
  }

  // Ghi Segments
  for (const seg of stagedSegments) {
    if (!dryRun) {
      try {
        await db
          .insert(sourceSegments)
          .values(seg)
          .onConflictDoUpdate({
            target: sourceSegments.id,
            set: {
              sourceId: seg.sourceId,
              page: seg.page,
              startSeconds: seg.startSeconds,
              endSeconds: seg.endSeconds,
              textContent: seg.textContent,
              transcriptContent: seg.transcriptContent,
              verifiedTranscript: seg.verifiedTranscript,
              language: seg.language,
              origin: "drive",
            },
          });
      } catch (err) {
        result.errors.push({
          id: seg.id,
          message: `Lỗi upsert segment: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    if (segmentOrigins.has(seg.id)) {
      result.updated.push(`segment:${seg.id}`);
    } else {
      result.added.push(`segment:${seg.id}`);
    }
  }

  // Ghi Activities
  for (const act of stagedActivities) {
    if (!dryRun) {
      try {
        await db
          .insert(activities)
          .values(act)
          .onConflictDoUpdate({
            target: activities.id,
            set: {
              slot: act.slot,
              mode: act.mode,
              title: act.title,
              objective: act.objective,
              durationMinutes: act.durationMinutes,
              difficulty: act.difficulty,
              promptText: act.promptText,
              feedbackGuide: act.feedbackGuide,
              rubricJson: act.rubricJson,
              answerReveal: act.answerReveal,
              purpose: act.purpose,
              reviewState: act.reviewState,
              segmentIds: act.segmentIds,
              questionsFile: act.questionsFile,
              questions: act.questions,
              output: act.output,
              topic: act.topic,
              origin: "drive",
            },
          });
      } catch (err) {
        result.errors.push({
          id: act.id,
          message: `Lỗi upsert activity: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    if (activityOrigins.has(act.id)) {
      result.updated.push(`activity:${act.id}`);
    } else {
      result.added.push(`activity:${act.id}`);
    }
  }

  // Thêm structural warnings
  for (const w of structureWarnings) {
    result.errors.push({ message: `[warning] ${w}` });
  }

  return result;
}
