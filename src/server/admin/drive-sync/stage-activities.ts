/**
 * Phase 1 staging — approved activities. Each activity may reference
 * prompt_file / rubric_file / questions_file (listening only); all are
 * downloaded and validated BEFORE any DB write (Phase 2 never half-writes).
 *
 * Dependency rule: an activity referencing a segment that failed to load or
 * is conflict-blocked is skipped with an explanatory error.
 */
import yaml from "yaml";
import { activities } from "../../../db/schema";
import { validateListeningQuestions } from "../../../lib/listening-questions";
import { DriveNetworkOrQuotaError } from "../../providers/google-drive";
import type { ManifestActivity } from "../../seed/manifest-parser";
import type { DriveFileReader } from "./drive-files";
import type { StagingOutcome, SyncError } from "./types";

export type StagedActivity = typeof activities.$inferInsert & {
  questions?: unknown;
};

function fatal(err: unknown, id: string, file: string): SyncError | null {
  return err instanceof DriveNetworkOrQuotaError
    ? {
        id,
        file,
        message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
      }
    : null;
}

type FileRead =
  | { ok: true; content: string }
  | { ok: false; fatal?: SyncError };

/** Đọc file Drive; `ok=false` (không fatal) = activity bỏ qua, `fatal` = dừng sync. */
async function readActivityFile(
  readFile: DriveFileReader,
  actId: string,
  path: string,
  missingMessage: string,
  loadErrorLabel: string,
  errors: SyncError[]
): Promise<FileRead> {
  try {
    const content = await readFile(path);
    if (content === null) {
      errors.push({ id: actId, file: path, message: missingMessage });
      return { ok: false };
    }
    return { ok: true, content };
  } catch (err) {
    const fatalError = fatal(err, actId, path);
    if (fatalError) return { ok: false, fatal: fatalError };
    errors.push({
      id: actId,
      file: path,
      message: `${loadErrorLabel} ${path}: ${err instanceof Error ? err.message : String(err)}`,
    });
    return { ok: false };
  }
}

/** questions_file của bài nghe: bắt buộc + phải đúng schema màn nghe đọc. */
async function stageQuestions(
  act: ManifestActivity,
  readFile: DriveFileReader,
  errors: SyncError[]
): Promise<{ value: unknown; fatal?: SyncError } | null> {
  if (act.mode !== "listening") return { value: null };
  if (!act.questions_file) {
    errors.push({
      id: act.id,
      message: `Activity nghe "${act.id}" bắt buộc phải khai báo questions_file trong manifest.`,
    });
    return null;
  }

  const r = await readActivityFile(
    readFile,
    act.id,
    act.questions_file,
    `Activity "${act.id}" thiếu file câu hỏi nghe: ${act.questions_file}`,
    "Lỗi tải/parse",
    errors
  );
  if (!r.ok) {
    if (r.fatal) return { value: null, fatal: r.fatal };
    return null;
  }

  try {
    const parsed = yaml.parse(r.content);
    const rawList = Array.isArray(parsed) ? parsed : parsed?.questions;
    const val = validateListeningQuestions(rawList);
    if (!val.ok) {
      errors.push({
        id: act.id,
        file: act.questions_file,
        message: `File câu hỏi nghe "${act.questions_file}" không hợp lệ: ${val.errors.join("; ")}`,
      });
      return null;
    }
    return { value: val.value };
  } catch (err) {
    errors.push({
      id: act.id,
      file: act.questions_file,
      message: `Lỗi tải/parse ${act.questions_file}: ${err instanceof Error ? err.message : String(err)}`,
    });
    return null;
  }
}

export async function stageApprovedActivities(
  approvedActivities: ManifestActivity[],
  blocked: {
    blockedActivityIds: Set<string>;
    blockedSegmentIds: Set<string>;
  },
  failedSegmentIds: Set<string>,
  readFile: DriveFileReader
): Promise<StagingOutcome<StagedActivity>> {
  const staged: StagedActivity[] = [];
  const errors: SyncError[] = [];

  for (const act of approvedActivities) {
    if (blocked.blockedActivityIds.has(act.id)) continue;

    // Chặn phụ thuộc: segment lỗi tải file hoặc xung đột → bỏ qua activity
    if (act.segment_ids && Array.isArray(act.segment_ids)) {
      const brokenSeg = act.segment_ids.find(
        (sid) => failedSegmentIds.has(sid) || blocked.blockedSegmentIds.has(sid)
      );
      if (brokenSeg) {
        errors.push({
          id: act.id,
          message: `Activity "${act.id}" tham chiếu segment "${brokenSeg}" bị lỗi tải file hoặc xung đột. Bỏ qua không nạp activity này.`,
        });
        continue;
      }
    }

    // Tải prompt_file
    let promptText: string | null = null;
    if (act.prompt_file) {
      const r = await readActivityFile(
        readFile,
        act.id,
        act.prompt_file,
        `Activity "${act.id}" thiếu file đề bài: ${act.prompt_file}`,
        "Lỗi tải",
        errors
      );
      if (!r.ok) {
        if (r.fatal) return { staged, errors, fatalError: r.fatal };
        continue;
      }
      promptText = r.content;
    }

    // Tải rubric_file (yaml → json)
    let rubricJson: unknown = null;
    if (act.rubric_file) {
      const r = await readActivityFile(
        readFile,
        act.id,
        act.rubric_file,
        `Activity "${act.id}" thiếu file rubric: ${act.rubric_file}`,
        "Lỗi tải/parse",
        errors
      );
      if (!r.ok) {
        if (r.fatal) return { staged, errors, fatalError: r.fatal };
        continue;
      }
      try {
        rubricJson = yaml.parse(r.content);
      } catch (err) {
        errors.push({
          id: act.id,
          file: act.rubric_file,
          message: `Lỗi tải/parse ${act.rubric_file}: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    // Tải questions_file (chỉ bài nghe)
    const q = await stageQuestions(act, readFile, errors);
    if (q?.fatal) return { staged, errors, fatalError: q.fatal };
    if (act.mode === "listening" && q === null) continue;
    const questionsJson = q?.value ?? null;

    staged.push({
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

  return { staged, errors };
}
