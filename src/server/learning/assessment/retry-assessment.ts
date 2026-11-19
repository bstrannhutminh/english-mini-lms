/**
 * Chấm lại bài (POST /api/v1/assessments/[id]/retry):
 *   1. Sweeper — assessment kẹt quá hạn → failed ngay khi được đọc.
 *   2. Guard — chỉ cho retry khi status="failed" (queued/processing/needs_input
 *      → 409 "đang chấm"; feedback_ready → 409 "đã chấm").
 *   3. Cap — runVersion ≥ MAX_ASSESSMENT_ATTEMPTS → 422. runVersion được tăng
 *      NGAY KHI bắt đầu retry nên lượt thất bại cũng tính vào giới hạn
 *      (sửa lỗi: code cũ chỉ tăng khi thành công → retry vô hạn).
 *   4. Evaluate — cùng evaluateSubmission với luồng nộp → có nhánh
 *      listening (sửa lỗi chấm lại bài nghe bằng writing evaluator) và
 *      mimeType lấy từ media_objects (không hardcode audio/webm).
 *   5. Persist + status — feedback_version mới, dọn error_observations cũ.
 */
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  learningSessions,
  submissions,
  assessments,
  activities,
} from "@/db/schema";
import { ValidationError } from "../errors";
import { toVietnameseGeminiError } from "@/server/providers/gemini/call-gemini";
import { evaluateSubmission } from "./evaluate-submission";
import { persistEvaluationResult } from "./persist-evaluation";
import {
  sweepStuckAssessment,
  checkRetryAllowed,
  markAssessmentProcessing,
  markAssessmentReady,
  markAssessmentFailed,
} from "./assessment-status";

export async function retryAssessment(
  assessmentId: string,
  currentLearnerId: string,
  isAdmin = false
) {
  const [found] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!found) {
    throw new ValidationError("Không tìm thấy lượt chấm bài.", 404);
  }

  // 1. Sweeper: kẹt quá hạn → failed trước khi xét guard.
  const assessment = await sweepStuckAssessment(found);

  // 2. Guard trạng thái + giới hạn lần thử (pure, đã qua sweeper).
  const verdict = checkRetryAllowed(assessment);
  if (!verdict.ok) {
    throw new ValidationError(verdict.message, verdict.statusCode);
  }

  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, assessment.submissionId), isNull(submissions.deletedAt)))
    .limit(1);

  if (!submission) {
    throw new ValidationError("Không tìm thấy bài nộp hoặc bài nộp đã bị xoá.", 404);
  }

  const learnerId = assessment.learnerId;
  if (!isAdmin && learnerId !== currentLearnerId) {
    throw new ValidationError("Không có quyền chấm lại bài nộp này.", 403);
  }

  const [session] = await db
    .select({ activityId: learningSessions.activityId })
    .from(learningSessions)
    .where(eq(learningSessions.id, submission.sessionId))
    .limit(1);

  if (!session) {
    throw new ValidationError("Không tìm thấy phiên học liên quan.", 404);
  }

  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, session.activityId))
    .limit(1);

  if (!activity) {
    throw new ValidationError("Không tìm thấy thông tin bài tập.", 404);
  }

  // 3. Đánh dấu lượt chạy mới NGAY từ đầu (tính cả lượt thất bại vào cap).
  const nextRunVersion = assessment.runVersion + 1;
  await markAssessmentProcessing(assessment.id, nextRunVersion);

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
      runVersion: nextRunVersion,
      activityMode: activity.mode,
      rubricJson: activity.rubricJson,
      outcome,
      replaceErrorObservations: true,
    });

    await markAssessmentReady(assessment.id);

    return { success: true as const, feedback };
  } catch (err) {
    // Chuẩn hoá: EnvError không lộ tên biến môi trường cho người học.
    const detail = toVietnameseGeminiError(err).message;
    await markAssessmentFailed(assessment.id, detail);

    // Trả thông báo tiếng Việt về client (503 → envelope có message rõ).
    throw new ValidationError(
      `Chấm lại không thành công: ${detail}`,
      503
    );
  }
}
