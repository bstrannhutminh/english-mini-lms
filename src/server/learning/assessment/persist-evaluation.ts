/**
 * Bước persist của pipeline chấm bài — ATOMIC trong 1 transaction:
 *   feedback_versions (snapshot mới, append-only theo runVersion)
 *   error_observations (lỗi → kho ôn tập, bulk insert; retry thì dọn bản cũ)
 *   usage_events (token + model — cả local evaluator vẫn ghi, token=0)
 *   assessments.status → feedback_ready
 *
 * Crash giữa chừng → rollback toàn bộ: không còn trạng thái nửa vời
 * (feedback có nhưng status treo, error_observations ghi một nửa).
 * Assessment kẹt processing được sweeper đánh failed → learner chấm lại sạch.
 *
 * Network (gọi Gemini) KHÔNG nằm trong transaction — xem evaluate-submission.
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  assessments,
  feedbackVersions,
  errorObservations,
  usageEvents,
} from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import type { EvaluationOutcome } from "./evaluate-submission";

/** Kiểu transaction handle của drizzle — cho phép caller gom thêm write vào cùng tx. */
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

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
  args: PersistEvaluationArgs,
  /**
   * Write bổ sung cần atomic cùng feedback (ví dụ learning_sessions → completed
   * ở luồng nộp bài). Chỉ nhận write DB thuần — tuyệt đối không gọi network ở đây.
   */
  extraInTx?: (tx: DbTransaction) => Promise<void>
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

  // pronunciation (speaking) snapshot cùng rubric tại thời điểm chấm.
  // transcript do AI bóc băng (speaking) cũng lưu vào payload jsonb này —
  // trước đây bị bỏ mất nên trang feedback hiển thị nhầm ghi chú learner.
  // Shape khớp rubricSnapshotPayloadSchema trong contracts/submission.ts.
  //
  // CHỈ lưu transcript khi pronunciation assessed (có audio thật): nhánh
  // text-only transcript chỉ là bản sao bài learner tự gõ — không thêm thông
  // tin mà còn tái tạo lỗi hiển thị nhầm "AI nghe được".
  const hasRealAudioTranscript =
    outcome.feedback.pronunciation?.status === "assessed" &&
    Boolean(outcome.feedback.transcript);
  const rubricSnapshot = {
    pronunciation: outcome.feedback.pronunciation || null,
    rubric: (rubricJson ?? null) as Record<string, unknown> | null,
    ...(hasRealAudioTranscript
      ? { transcript: outcome.feedback.transcript }
      : {}),
    ...(hasRealAudioTranscript &&
    typeof outcome.feedback.transcript_confidence === "number"
      ? { transcript_confidence: outcome.feedback.transcript_confidence }
      : {}),
  };

  return db.transaction(async (tx) => {
    const [feedback] = await tx
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
      const oldFeedbacks = await tx
        .select({ id: feedbackVersions.id })
        .from(feedbackVersions)
        .where(eq(feedbackVersions.submissionId, submissionId));
      // Loại feedback vừa insert — dọn xong mới ghi bộ observations mới nên
      // không ảnh hưởng kết quả, nhưng loại rõ ràng để tránh xoá nhầm nếu
      // thứ tự trong transaction sau này thay đổi.
      const oldIds = oldFeedbacks.map((f) => f.id).filter((id) => id !== feedback.id);
      if (oldIds.length > 0) {
        await tx
          .delete(errorObservations)
          .where(inArray(errorObservations.sourceFeedbackId, oldIds));
      }
    }

    // Bulk insert 1 lần thay vì từng row — bài nhiều lỗi qua pooler remote
    // từng tốn 1 roundtrip/observation.
    const defaultCategory = modeSkill(activityMode) === "reading" ? "vocabulary" : "grammar";
    if (outcome.feedback.observations.length > 0) {
      await tx.insert(errorObservations).values(
        outcome.feedback.observations.map((obs) => ({
          learnerId,
          sourceFeedbackId: feedback.id,
          category: (obs as { category?: string }).category || defaultCategory,
          evidence: obs.original,
        }))
      );
    }

    // usage_events: ghi cho MỌI lượt chấm (kể cả local evaluator, token=0)
    await tx.insert(usageEvents).values({
      learnerId,
      action: `evaluate_${activityMode}`,
      entityType: "submission",
      entityId: submissionId,
      tokenInput: outcome.tokenInput,
      tokenOutput: outcome.tokenOutput,
      modelName: outcome.modelName,
    });

    // Status chuyển feedback_ready trong cùng transaction: feedback tồn tại
    // ⟺ status ready — không còn cửa sổ crash để feedback có mà status treo.
    await tx
      .update(assessments)
      .set({ status: "feedback_ready", updatedAt: new Date() })
      .where(eq(assessments.id, assessmentId));

    if (extraInTx) await extraInTx(tx);

    return feedback;
  });
}
