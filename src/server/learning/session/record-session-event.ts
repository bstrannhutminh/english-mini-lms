import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { learningSessions, sessionEvents } from "@/db/schema";
import { ValidationError } from "../errors";

/**
 * Ghi nhận sự kiện trong phiên (session_events).
 * kind=hint/reveal là nguồn duy nhất để suy ra submissions.assisted —
 * client KHÔNG được gửi trường assisted (invariant #2).
 * pause/resume/finish còn cập nhật activeSeconds + status của phiên.
 */
export async function recordSessionEvent(
  sessionId: string,
  learnerId: string,
  kind: "hint" | "reveal" | "pause" | "resume" | "finish",
  payload?: unknown
) {
  // Xác minh session thuộc learner
  const [session] = await db
    .select({
      id: learningSessions.id,
      status: learningSessions.status,
      activeSeconds: learningSessions.activeSeconds,
    })
    .from(learningSessions)
    .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
    .limit(1);

  if (!session) {
    throw new ValidationError("Không tìm thấy phiên học hoặc phiên không thuộc người dùng.", 404);
  }

  // Tính activeSeconds từ event pause/resume gần nhất
  if (kind === "pause" || kind === "resume" || kind === "finish") {
    const [lastEvent] = await db
      .select({ kind: sessionEvents.kind, eventAt: sessionEvents.eventAt })
      .from(sessionEvents)
      .where(eq(sessionEvents.sessionId, sessionId))
      .orderBy(desc(sessionEvents.eventAt))
      .limit(1);

    const wasActive =
      !lastEvent ||
      lastEvent.kind === "resume" ||
      (lastEvent.kind !== "pause" && lastEvent.kind !== "finish");

    if (wasActive) {
      const lastTime = lastEvent ? new Date(lastEvent.eventAt).getTime() : Date.now();
      const deltaSec = Math.round((Date.now() - lastTime) / 1000);
      const newActiveSeconds = (session.activeSeconds || 0) + Math.max(0, deltaSec);

      await db
        .update(learningSessions)
        .set({
          activeSeconds: newActiveSeconds,
          status: kind === "finish" ? "completed" : kind === "pause" ? "paused" : session.status,
          updatedAt: new Date(),
        })
        .where(eq(learningSessions.id, sessionId));
    } else if (kind === "resume") {
      await db
        .update(learningSessions)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(learningSessions.id, sessionId));
    } else if (kind === "finish") {
      await db
        .update(learningSessions)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(learningSessions.id, sessionId));
    }
  }

  const [event] = await db
    .insert(sessionEvents)
    .values({
      sessionId,
      learnerId,
      kind,
      payload: payload ? (payload as Record<string, unknown>) : null,
    })
    .returning();

  return event;
}
