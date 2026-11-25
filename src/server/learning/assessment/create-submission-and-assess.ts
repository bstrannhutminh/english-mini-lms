/**
 * Pipeline "Nộp bài → chấm AI" (POST /api/v1/sessions/[id]/submissions):
 * append-only submission + assessment trong transaction chống nộp trùng, sau
 * đó evaluate/persist feedback. Submission luôn được giữ lại kể cả khi AI lỗi.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { learningSessions } from "@/db/schema";
import { ValidationError } from "../errors";
import { MAX_SUBMISSION_BODY_CHARS } from "../limits";
import { loadReadyMedia } from "./submission-media";
import { toVietnameseGeminiError } from "@/server/providers/gemini/call-gemini";
import { evaluateSubmission } from "./evaluate-submission";
import { persistEvaluationResult } from "./persist-evaluation";
import {
  markAssessmentProcessing,
  markAssessmentReady,
  markAssessmentFailed,
} from "./assessment-status";
import { insertOrReuseSubmission } from "./insert-or-reuse-submission";
import { recordSessionEvent } from "../session/record-session-event";

export async function createSubmissionAndAssess(
  sessionId: string,
  learnerId: string,
  body?: string,
  parentId?: string,
  mediaId?: string
) {
  if (body && body.length > MAX_SUBMISSION_BODY_CHARS) {
    throw new ValidationError(
      `Nội dung bài nộp quá dài (tối đa ${MAX_SUBMISSION_BODY_CHARS.toLocaleString("vi-VN")} ký tự).`,
      422
    );
  }

  // Media phải ready + thuộc learner + ≤ 300s khi có gắn media.
  if (mediaId) await loadReadyMedia(mediaId, learnerId);

  const prepared = await insertOrReuseSubmission({
    sessionId,
    learnerId,
    body,
    parentId,
    mediaId,
  });

  // Retry/double-click cùng payload: trả nguyên kết quả cũ, không insert và
  // không gọi Gemini lần thứ hai. Payload khác đã bị chặn 409 trong helper.
  if (prepared.reused) {
    return {
      submission: prepared.submission,
      assessment: prepared.assessment,
      feedback: prepared.feedback,
    };
  }

  const { submission, assessment, activity } = prepared;
  await markAssessmentProcessing(assessment.id);

  // Backup server-side cho client finish fire-and-forget. Nếu client đã ghi,
  // state machine lifecycle biến event này thành no-op về active_seconds.
  try {
    await recordSessionEvent(sessionId, learnerId, "finish", { source: "submission_server" });
  } catch (eventError) {
    console.error("Không ghi được finish event sau submit:", eventError);
  }

  try {
    const outcome = await evaluateSubmission(activity, {
      body: submission.body,
      mediaId: submission.mediaId,
      confirmedTranscript: submission.confirmedTranscript,
    });

    const feedback = await persistEvaluationResult({
      assessmentId: assessment.id,
      learnerId,
      submissionId: submission.id,
      runVersion: 1,
      activityMode: activity.mode,
      rubricJson: activity.rubricJson,
      outcome,
    });

    await markAssessmentReady(assessment.id);
    await db
      .update(learningSessions)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(learningSessions.id, sessionId));

    return {
      submission,
      assessment: { ...assessment, status: "feedback_ready" as const },
      feedback,
    };
  } catch (evalError) {
    console.error("Lỗi khi gọi AI chấm bài:", evalError);

    // Chuẩn hoá qua toVietnameseGeminiError: không lộ tên biến môi trường/key.
    const resultRef = toVietnameseGeminiError(evalError).message;
    await markAssessmentFailed(assessment.id, resultRef);

    return {
      submission,
      assessment: { ...assessment, status: "failed" as const, resultRef },
      feedback: null,
    };
  }
}
