/**
 * Phase 1 staging — sources & segments. Downloads every referenced content
 * file (text/transcript) into memory; a Drive network/quota failure is fatal
 * and stops the whole sync (no partial writes ever reach Phase 2).
 */
import { sourceSegments, sources } from "../../../db/schema";
import { DriveNetworkOrQuotaError } from "../../providers/google-drive";
import type { ManifestSegment, ManifestSource } from "../../seed/manifest-parser";
import type { DriveFileReader } from "./drive-files";
import type { StagingOutcome, SyncError } from "./types";

type StagedSource = typeof sources.$inferInsert;
type StagedSegment = typeof sourceSegments.$inferInsert;

function fatal(err: unknown, id: string, file: string): SyncError | null {
  return err instanceof DriveNetworkOrQuotaError
    ? {
        id,
        file,
        message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
      }
    : null;
}

export function stageNeededSources(
  neededSourceIds: Set<string>,
  sourceMap: Map<string, ManifestSource>,
  blockedSourceIds: Set<string>
): StagingOutcome<StagedSource> {
  const staged: StagedSource[] = [];
  const errors: SyncError[] = [];

  for (const sourceId of neededSourceIds) {
    if (blockedSourceIds.has(sourceId)) continue;

    const src = sourceMap.get(sourceId);
    if (!src) {
      errors.push({
        id: sourceId,
        message: `Source "${sourceId}" được tham chiếu trong segment nhưng không có trong manifest.`,
      });
      continue;
    }

    staged.push({
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

  return { staged, errors };
}

export interface SegmentStagingOutcome extends StagingOutcome<StagedSegment> {
  failedSegmentIds: Set<string>;
}

async function readSegmentFile(
  readFile: DriveFileReader,
  segId: string,
  path: string,
  missingMessage: string,
  errors: SyncError[]
): Promise<{ content: string | null; fatal?: SyncError }> {
  try {
    const content = await readFile(path);
    if (content === null) {
      errors.push({ id: segId, file: path, message: missingMessage });
      return { content: null };
    }
    return { content };
  } catch (err) {
    const fatalError = fatal(err, segId, path);
    if (fatalError) return { content: null, fatal: fatalError };
    errors.push({
      id: segId,
      file: path,
      message: `Lỗi tải file ${path}: ${err instanceof Error ? err.message : String(err)}`,
    });
    return { content: null };
  }
}

export async function stageNeededSegments(
  neededSegmentIds: Set<string>,
  segmentMap: Map<string, ManifestSegment>,
  blocked: { blockedSegmentIds: Set<string>; blockedSourceIds: Set<string> },
  readFile: DriveFileReader
): Promise<SegmentStagingOutcome> {
  const staged: StagedSegment[] = [];
  const errors: SyncError[] = [];
  const failedSegmentIds = new Set<string>();

  for (const segId of neededSegmentIds) {
    if (blocked.blockedSegmentIds.has(segId)) continue;

    const seg = segmentMap.get(segId);
    if (!seg) continue;

    // Nếu source của segment bị block hoặc không được nạp
    if (blocked.blockedSourceIds.has(seg.source_id)) {
      failedSegmentIds.add(segId);
      continue;
    }

    let textContent: string | null = null;
    let transcriptContent: string | null = null;
    let failed = false;

    if (seg.text_file) {
      const r = await readSegmentFile(
        readFile,
        segId,
        seg.text_file,
        `Segment "${segId}" thiếu file văn bản: ${seg.text_file}`,
        errors
      );
      if (r.fatal) return { staged, errors, failedSegmentIds, fatalError: r.fatal };
      if (r.content === null) failed = true;
      else textContent = r.content;
    }

    if (!failed && seg.transcript_file) {
      const r = await readSegmentFile(
        readFile,
        segId,
        seg.transcript_file,
        `Segment "${segId}" thiếu file transcript: ${seg.transcript_file}`,
        errors
      );
      if (r.fatal) return { staged, errors, failedSegmentIds, fatalError: r.fatal };
      if (r.content === null) failed = true;
      else transcriptContent = r.content;
    }

    if (failed) {
      failedSegmentIds.add(segId);
      continue;
    }

    staged.push({
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

  return { staged, errors, failedSegmentIds };
}
