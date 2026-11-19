/**
 * Vòng đời trạng thái assessment + "sweeper" chống treo.
 *
 * Một lượt chấm chạy đồng bộ trong route (maxDuration=60s). Nếu request bị
 * kill giữa chừng (timeout Vercel, crash), row kẹt ở queued/processing mãi.
 * Sweeper: khi QUAN SÁT thấy assessment kẹt quá STUCK_ASSESSMENT_MS
 * (= 2× GEMINI_TIMEOUT_MS), đánh dấu failed kèm thông báo tiếng Việt.
 *
 * Nơi gọi (đủ rẻ và đúng, không cần cron):
 *   - getSubmissionWithFeedback — mỗi lần learner mở trang Bài của tôi
 *   - retryAssessment — trước khi quyết định cho chấm lại
 * Bài nộp (submission) luôn còn nguyên; UI hiển thị nút "Chấm lại".
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { assessments } from "@/db/schema";
import { STUCK_ASSESSMENT_MS, MAX_ASSESSMENT_ATTEMPTS } from "../limits";
import { ValidationError } from "../errors";

export const STUCK_ASSESSMENT_MESSAGE =
  "Hệ thống chấm bài bị gián đoạn (xử lý quá lâu). Bài nộp của bạn vẫn được lưu an toàn — vui lòng bấm \"Chấm lại\".";

type AssessmentRow = typeof assessments.$inferSelect;

/** Pure predicate — unit-test được. */
export function isAssessmentStuck(
  assessment: Pick<AssessmentRow, "status" | "updatedAt">,
  now: number = Date.now()
): boolean {
  if (assessment.status !== "processing" && assessment.status !== "queued") {
    return false;
  }
  return now - new Date(assessment.updatedAt).getTime() > STUCK_ASSESSMENT_MS;
}

/**
 * Quan sát một assessment: nếu kẹt quá hạn → cập nhật failed trong DB và
 * trả bản ghi đã vá. Không kẹt → trả nguyên bản.
 */
export async function sweepStuckAssessment<T extends Pick<AssessmentRow, "id" | "status" | "updatedAt" | "resultRef">>(
  assessment: T
): Promise<T> {
  if (!isAssessmentStuck(assessment)) {
    return assessment;
  }
  await markAssessmentFailed(assessment.id, STUCK_ASSESSMENT_MESSAGE);
  return {
    ...assessment,
    status: "failed",
    resultRef: STUCK_ASSESSMENT_MESSAGE,
  } as T;
}

export async function markAssessmentProcessing(
  assessmentId: string,
  runVersion?: number
) {
  await db
    .update(assessments)
    .set({
      status: "processing",
      ...(runVersion !== undefined ? { runVersion } : {}),
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, assessmentId));
}

export async function markAssessmentReady(assessmentId: string) {
  await db
    .update(assessments)
    .set({ status: "feedback_ready", updatedAt: new Date() })
    .where(eq(assessments.id, assessmentId));
}

export async function markAssessmentFailed(assessmentId: string, resultRef: string) {
  await db
    .update(assessments)
    .set({ status: "failed", resultRef, updatedAt: new Date() })
    .where(eq(assessments.id, assessmentId));
}

export type RetryVerdict =
  | { ok: true }
  | { ok: false; statusCode: number; message: string };

/**
 * Guard thuần cho retryAssessment (đã qua sweeper — "processing" còn lại
 * nghĩa là còn hạn, không phải kẹt):
 *   - feedback_ready → 409 (đã chấm xong)
 *   - queued/processing/needs_input → 409 (đang chấm — chờ)
 *   - failed + runVersion ≥ MAX → 422 (hết lượt)
 *   - failed → ok
 */
export function checkRetryAllowed(
  assessment: Pick<AssessmentRow, "status" | "runVersion">
): RetryVerdict {
  if (assessment.status === "feedback_ready") {
    return {
      ok: false,
      statusCode: 409,
      message: "Bài nộp đã được chấm thành công, không thể chấm lại.",
    };
  }
  if (assessment.status !== "failed") {
    return {
      ok: false,
      statusCode: 409,
      message: "Bài nộp đang trong quá trình chấm điểm, vui lòng chờ trong giây lát.",
    };
  }
  if (assessment.runVersion >= MAX_ASSESSMENT_ATTEMPTS) {
    return {
      ok: false,
      statusCode: 422,
      message: `Bài nộp đã vượt quá số lần chấm tối đa (${MAX_ASSESSMENT_ATTEMPTS} lần). Vui lòng liên hệ quản trị viên.`,
    };
  }
  return { ok: true };
}

/** Tiện ích: ném ValidationError theo verdict (cho retry service). */
export function assertRetryAllowed(
  assessment: Pick<AssessmentRow, "status" | "runVersion">
): void {
  const verdict = checkRetryAllowed(assessment);
  if (!verdict.ok) {
    throw new ValidationError(verdict.message, verdict.statusCode);
  }
}
