import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { drafts } from "@/db/schema";
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

  const [existingDraft] = await db
    .select({ id: drafts.id, version: drafts.version })
    .from(drafts)
    .where(and(eq(drafts.sessionId, sessionId), eq(drafts.learnerId, learnerId)))
    .limit(1);

  if (!existingDraft) {
    const [newDraft] = await db
      .insert(drafts)
      .values({
        sessionId,
        learnerId,
        content,
        version: 1,
      })
      .returning();
    return newDraft;
  }

  const [updatedDraft] = await db
    .update(drafts)
    .set({
      content,
      version: Math.max(existingDraft.version + 1, version),
      updatedAt: new Date(),
    })
    .where(eq(drafts.id, existingDraft.id))
    .returning();

  return updatedDraft;
}
