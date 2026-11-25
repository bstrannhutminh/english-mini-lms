import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { drafts, learningSessions } from "@/db/schema";
import { ValidationError } from "../errors";
import { MAX_DRAFT_CHARS } from "../limits";

/**
 * Lưu bản nháp (drafts) với optimistic version.
 * Giới hạn server-side: content ≤ MAX_DRAFT_CHARS (20.000) — route contract
 * không đặt max nên service là nơi chặn cuối cùng.
 */
export async function saveDraft(
  sessionId: string,
  learnerId: string,
  content: string,
  version = 1
) {
  if (content.length > MAX_DRAFT_CHARS) {
    throw new ValidationError(
      `Bản nháp quá dài (${content.length.toLocaleString("vi-VN")} ký tự). Giới hạn ${MAX_DRAFT_CHARS.toLocaleString("vi-VN")} ký tự.`,
      422
    );
  }

  // Phiên phải thuộc learner — trước đây thiếu check, cho phép ghi draft
  // trỏ vào sessionId của người khác.
  const [session] = await db
    .select({ id: learningSessions.id })
    .from(learningSessions)
    .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
    .limit(1);

  if (!session) {
    throw new ValidationError("Không tìm thấy phiên học hoặc phiên không thuộc người dùng.", 404);
  }

  // Upsert atomic trên unique index drafts_one_per_session_learner: select-rồi-
  // insert như bản cũ có race khi 2 autosave chạy song song (2 tab/retry mạng) —
  // request thua gặp unique violation thành 500 thô. Version giữ đúng ngữ nghĩa
  // cũ: max(version hiện có + 1, version client gửi).
  const [draft] = await db
    .insert(drafts)
    .values({
      sessionId,
      learnerId,
      content,
      version: 1,
    })
    .onConflictDoUpdate({
      target: [drafts.sessionId, drafts.learnerId],
      set: {
        content,
        version: sql`GREATEST(${drafts.version} + 1, ${version})`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return draft;
}
