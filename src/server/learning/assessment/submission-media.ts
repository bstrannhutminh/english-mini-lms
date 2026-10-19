/**
 * Kiểm tra media_objects trước khi gắn vào submission / dùng chấm speaking.
 * Giới hạn server-side bổ sung cho upload-time check trong media service:
 *   - tồn tại + status="ready"
 *   - thuộc đúng learner (tránh gắn media của người khác)
 *   - durationSeconds ≤ 300 (5 phút) nếu có ghi nhận
 */
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { mediaObjects } from "@/db/schema";
import { ValidationError } from "../errors";
import { MAX_AUDIO_DURATION_SECONDS } from "../limits";

export type ReadyMedia = Pick<
  typeof mediaObjects.$inferSelect,
  "id" | "storageKey" | "mimeType" | "durationSeconds" | "learnerId" | "status"
>;

export async function loadReadyMedia(
  mediaId: string,
  learnerId: string
): Promise<ReadyMedia> {
  const [media] = await db
    .select({
      id: mediaObjects.id,
      storageKey: mediaObjects.storageKey,
      mimeType: mediaObjects.mimeType,
      durationSeconds: mediaObjects.durationSeconds,
      learnerId: mediaObjects.learnerId,
      status: mediaObjects.status,
    })
    .from(mediaObjects)
    .where(and(eq(mediaObjects.id, mediaId), eq(mediaObjects.learnerId, learnerId)))
    .limit(1);

  if (!media || media.status !== "ready") {
    throw new ValidationError(
      "Tệp âm thanh không tồn tại hoặc chưa ở trạng thái sẵn sàng (ready).",
      422
    );
  }

  if (
    media.durationSeconds !== null &&
    media.durationSeconds > MAX_AUDIO_DURATION_SECONDS
  ) {
    throw new ValidationError(
      `Thời lượng ghi âm (${media.durationSeconds}s) vượt quá giới hạn ${MAX_AUDIO_DURATION_SECONDS} giây. Vui lòng ghi âm ngắn hơn.`,
      422
    );
  }

  return media;
}
