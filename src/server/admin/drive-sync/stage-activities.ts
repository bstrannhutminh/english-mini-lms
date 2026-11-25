/**
 * Phase 1 staging — approved activities. Each activity may reference
 * prompt_file / rubric_file / questions_file (listening + ielts-listening);
 * all are downloaded and validated BEFORE any DB write.
 *
 * Dependency rule: an activity referencing a segment that failed to load or
 * is conflict-blocked is skipped with an explanatory error.
 */
import yaml from "yaml";
import { activities } from "../../../db/schema";
import { modeSkill } from "../../../lib/modes";
import type { ManifestActivity } from "../../seed/manifest-parser";
import type { DriveFileReader } from "./drive-files";
import { readActivityFile, stageQuestions } from "./stage-activity-files";
import type { StagingOutcome, SyncError } from "./types";

export type StagedActivity = typeof activities.$inferInsert & {
  questions?: unknown;
};

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

    // Tải questions_file (mọi activity có skill listening, gồm ielts-listening)
    const q = await stageQuestions(act, readFile, errors);
    if (q?.fatal) return { staged, errors, fatalError: q.fatal };
    if (modeSkill(act.mode) === "listening" && q === null) continue;
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
