import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { learningSessions, activities } from "@/db/schema";
import { ConflictError } from "../errors";
import { isUniqueViolation } from "@/server/pg-errors";

/** Phiên đang mở (ready/active/paused) mới nhất của learner cho một activity. */
async function findOpenSession(learnerId: string, activityId: string) {
  const [existing] = await db
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
  return existing;
}

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
    const existingSession = await findOpenSession(learnerId, activityId);

    if (existingSession) {
      throw new ConflictError(
        "Bạn đang có một phiên học chưa hoàn thành cho bài này.",
        existingSession.id
      );
    }
  }

  try {
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
  } catch (err) {
    // Race double-tap/2 tab: check-then-insert ở trên không atomic — request
    // thua unique partial index learning_sessions_one_open_per_activity.
    // Trả 409 kèm phiên hiện có (giống nhánh checkConflict) thay vì 500 thô.
    if (isUniqueViolation(err)) {
      const existingSession = await findOpenSession(learnerId, activityId);
      if (existingSession) {
        throw new ConflictError(
          "Bạn đang có một phiên học chưa hoàn thành cho bài này.",
          existingSession.id
        );
      }
    }
    throw err;
  }
}
