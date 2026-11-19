/**
 * Luồng "Tôi không đồng ý" trên feedback_versions.
 * - flag: đặt review_state = "under_review" + đánh dấu observation cụ thể
 *   (giữ nguyên version — không xoá/sửa nội dung nhận xét).
 * - resolve: admin rà soát xong → review_state = "active".
 */
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { feedbackVersions } from "@/db/schema";
import { ValidationError } from "./session.service";

interface FlagInput {
  observationIndex?: number;
  reason?: string;
}

/**
 * Gắn cờ một nhận xét (hoặc cả bản feedback) để admin rà soát.
 * Learner chỉ flag được feedback của chính mình; admin flag được tất cả.
 * Trả về reviewState mới ("under_review").
 */
export async function flagFeedbackForReview(
  learner: { id: string; role: string },
  feedbackId: string,
  input: FlagInput
) {
  const [fb] = await db
    .select()
    .from(feedbackVersions)
    .where(
      learner.role === "admin"
        ? eq(feedbackVersions.id, feedbackId)
        : and(
            eq(feedbackVersions.id, feedbackId),
            eq(feedbackVersions.learnerId, learner.id)
          )
    )
    .limit(1);

  if (!fb) {
    throw new ValidationError(
      "Không tìm thấy nhận xét hoặc không có quyền truy cập.",
      404
    );
  }

  // Đánh dấu cờ trên observation cụ thể nếu có observationIndex hợp lệ
  let updatedObservations = fb.observations as
    | Array<Record<string, unknown>>
    | null;
  if (
    Array.isArray(updatedObservations) &&
    typeof input.observationIndex === "number" &&
    input.observationIndex >= 0 &&
    input.observationIndex < updatedObservations.length
  ) {
    const idx = input.observationIndex;
    updatedObservations = updatedObservations.map((obs, i) =>
      i === idx
        ? {
            ...obs,
            flagged: true,
            flaggedReason:
              input.reason || "Người học không đồng ý với nhận xét",
            flaggedAt: new Date().toISOString(),
          }
        : obs
    );
  }

  await db
    .update(feedbackVersions)
    .set({
      reviewState: "under_review",
      observations: updatedObservations || fb.observations,
      updatedAt: new Date(),
    })
    .where(eq(feedbackVersions.id, feedbackId));

  return { reviewState: "under_review" as const };
}

/** Admin đánh dấu đã rà soát xong — trả review_state về "active". */
export async function resolveFeedbackReview(feedbackId: string) {
  const [fb] = await db
    .select({ id: feedbackVersions.id })
    .from(feedbackVersions)
    .where(eq(feedbackVersions.id, feedbackId))
    .limit(1);

  if (!fb) {
    throw new ValidationError("Không tìm thấy nhận xét.", 404);
  }

  await db
    .update(feedbackVersions)
    .set({
      reviewState: "active",
      updatedAt: new Date(),
    })
    .where(eq(feedbackVersions.id, feedbackId));

  return { reviewState: "active" as const };
}
