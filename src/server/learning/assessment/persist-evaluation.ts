/**
 * Bước persist của pipeline chấm bài:
 *   feedback_versions (snapshot mới, append-only theo runVersion)
 *   error_observations (lỗi → kho ôn tập; retry thì dọn bản cũ của submission)
 *   usage_events (token + model — cả local evaluator vẫn ghi, token=0)
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  feedbackVersions,
  errorObservations,
  usageEvents,
} from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import type { EvaluationOutcome } from "./evaluate-submission";

export interface PersistEvaluationArgs {
  assessmentId: string;
  learnerId: string;
  submissionId: string;
  runVersion: number;
  activityMode: string;
  rubricJson: unknown;
  outcome: EvaluationOutcome;
  /**
   * true khi chấm lại (retry): xoá error_observations cũ của mọi
   * feedback_version thuộc submission trước khi ghi bộ mới — tránh trùng lỗi.
   */
  replaceErrorObservations?: boolean;
}

export async function persistEvaluationResult(
  args: PersistEvaluationArgs
) {
  const {
    assessmentId,
    learnerId,
    submissionId,
    runVersion,
    activityMode,
    rubricJson,
    outcome,
    replaceErrorObservations = false,
  } = args;

  // pronunciation (speaking) snapshot cùng rubric tại thời điểm chấm
  const rubricSnapshot = {
    pronunciation: outcome.feedback.pronunciation || null,
    rubric: (rubricJson ?? null) as Record<string, unknown> | null,
  };

  const [feedback] = await db
    .insert(feedbackVersions)
    .values({
      assessmentId,
      learnerId,
      submissionId,
      runVersion,
      rubricSnapshot,
      modelRef: outcome.modelName,
      observations: outcome.feedback.observations,
      strengths: outcome.feedback.strengths,
      nextAction: outcome.feedback.next_action,
      limitations: outcome.feedback.limitations,
      scores: outcome.feedback.scores,
      reviewState: "active",
    })
    .returning();

  if (replaceErrorObservations) {
    const oldFeedbacks = await db
      .select({ id: feedbackVersions.id })
      .from(feedbackVersions)
      .where(eq(feedbackVersions.submissionId, submissionId));
    if (oldFeedbacks.length > 0) {
      await db
        .delete(errorObservations)
        .where(
          inArray(
            errorObservations.sourceFeedbackId,
            oldFeedbacks.map((f) => f.id)
          )
        );
    }
  }

  const defaultCategory = modeSkill(activityMode) === "reading" ? "vocabulary" : "grammar";
  for (const obs of outcome.feedback.observations) {
    await db.insert(errorObservations).values({
      learnerId,
      sourceFeedbackId: feedback.id,
      category: (obs as { category?: string }).category || defaultCategory,
      evidence: obs.original,
    });
  }

  // usage_events: ghi cho MỌI lượt chấm (kể cả local evaluator, token=0)
  await db.insert(usageEvents).values({
    learnerId,
    action: `evaluate_${activityMode}`,
    entityType: "submission",
    entityId: submissionId,
    tokenInput: outcome.tokenInput,
    tokenOutput: outcome.tokenOutput,
    modelName: outcome.modelName,
  });

  return feedback;
}
