/**
 * Thay đổi trên submissions — TUÂN THỦ invariant append-only:
 * - confirmed_transcript là cột DUY NHẤT được PATCH (transcript bài nói do
 *   người học xác nhận lại sau khi AI gỡ band). `body` không bao giờ UPDATE.
 * - DELETE là soft-delete (deleted_at) + dọn file storage đính kèm.
 *   Bản sửa mới luôn là INSERT với parent_id, không qua đây.
 */
import { eq, and, isNull } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { submissions, mediaObjects } from "@/db/schema";
import { ValidationError } from "./session.service";

/**
 * Lưu transcript người học đã xác nhận/chỉnh sửa.
 * Chỉ áp dụng cho modality=audio — bài viết (text) không thể sửa sau nộp.
 */
export async function confirmSubmissionTranscript(
  learnerId: string,
  submissionId: string,
  confirmedTranscript: string
) {
  const [existing] = await db
    .select({ id: submissions.id, modality: submissions.modality })
    .from(submissions)
    .where(
      and(
        eq(submissions.id, submissionId),
        eq(submissions.learnerId, learnerId),
        isNull(submissions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    throw new ValidationError("Bài nộp không tồn tại hoặc đã bị xoá", 404);
  }

  if (existing.modality !== "audio") {
    throw new ValidationError(
      "Chỉ bài nói (audio) mới được cập nhật transcript. Bài viết không thể sửa nội dung sau khi nộp.",
      422
    );
  }

  const [updated] = await db
    .update(submissions)
    .set({
      confirmedTranscript,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(submissions.id, submissionId),
        eq(submissions.learnerId, learnerId),
        isNull(submissions.deletedAt)
      )
    )
    .returning();

  return updated;
}

/** Xoá file storage kèm theo submission (best-effort — lỗi chỉ warn). */
async function removeMediaFile(storageKey: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  try {
    const supabase = createClient(url, key);
    await supabase.storage.from("learner-media").remove([storageKey]);
  } catch (storageErr) {
    console.warn("[softDeleteSubmission] Cảnh báo xoá file storage:", storageErr);
  }
}

/**
 * Soft-delete bài nộp (đặt deleted_at) + cố gắng xoá file âm thanh đính kèm.
 * Không xoá cứng để giữ chuỗi revision/đối chiếu nếu cần khôi phục.
 */
export async function softDeleteSubmission(
  learnerId: string,
  submissionId: string
) {
  const [existing] = await db
    .select({ id: submissions.id, mediaId: submissions.mediaId })
    .from(submissions)
    .where(
      and(
        eq(submissions.id, submissionId),
        eq(submissions.learnerId, learnerId),
        isNull(submissions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    throw new ValidationError("Bài nộp không tồn tại hoặc đã bị xoá", 404);
  }

  await db
    .update(submissions)
    .set({ deletedAt: new Date() })
    .where(eq(submissions.id, submissionId));

  if (existing.mediaId) {
    const [media] = await db
      .select({ storageKey: mediaObjects.storageKey })
      .from(mediaObjects)
      .where(eq(mediaObjects.id, existing.mediaId))
      .limit(1);

    if (media?.storageKey) {
      await removeMediaFile(media.storageKey);
    }
  }
}
