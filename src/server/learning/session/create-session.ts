import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { learningSessions, activities } from "@/db/schema";
import { ConflictError } from "../errors";

export interface CreateSessionOptions {
  checkConflict?: boolean;
}

/**
 * Tạo phiên học mới (learning_sessions).
 * Chỉ tạo cho activity đã `approved`; tuỳ chọn chặn trùng phiên đang mở.
 */
export async function createSession(
  learnerId: string,
  activityId: string,
  targetMinutes: number,
  options?: CreateSessionOptions
) {
  const [act] = await db
    .select({ id: activities.id, reviewState: activities.reviewState })
    .from(activities)
    .where(and(eq(activities.id, activityId), eq(activities.reviewState, "approved")))
    .limit(1);

  if (!act) {
    throw new Error(`Activity "${activityId}" không tồn tại hoặc chưa được duyệt.`);
  }

  // Chặn tạo 2 phiên active trùng cùng 1 activity khi bật checkConflict
  if (options?.checkConflict) {
    const [existingSession] = await db
      .select({ id: learningSessions.id })
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          eq(learningSessions.activityId, activityId),
          inArray(learningSessions.status, ["active", "ready", "paused"])
        )
      )
      .orderBy(desc(learningSessions.createdAt))
      .limit(1);

    if (existingSession) {
      throw new ConflictError(
        "Bạn đang có một phiên học chưa hoàn thành cho bài này.",
        existingSession.id
      );
    }
  }

  const [session] = await db
    .insert(learningSessions)
    .values({
      learnerId,
      activityId,
      targetMinutes,
      status: "active",
      activeSeconds: 0,
      version: 1,
    })
    .returning();

  return session;
}
