import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { learningSessions, sessionEvents } from "@/db/schema";
import { ValidationError } from "../errors";
import {
  calculateSessionClockTransition,
  isSessionLifecycleEventKind,
} from "./session-clock";

/**
 * Ghi nhận sự kiện trong phiên (session_events).
 * kind=hint/reveal là nguồn duy nhất để suy ra submissions.assisted —
 * client KHÔNG được gửi trường assisted (invariant #2).
 *
 * pause/resume/finish cập nhật activeSeconds + status trong cùng transaction
 * có khoá hàng session. Nhờ đó hai event đến đồng thời (double click, retry
 * mạng, visibility + submit) không đọc cùng một baseline rồi cộng trùng giây.
 */
export async function recordSessionEvent(
  sessionId: string,
  learnerId: string,
  kind: "hint" | "reveal" | "pause" | "resume" | "finish",
  payload?: unknown
) {
  return db.transaction(async (tx) => {
    // Xác minh session thuộc learner và giữ khoá đến khi event được ghi.
    const [session] = await tx
      .select({
        id: learningSessions.id,
        status: learningSessions.status,
        activeSeconds: learningSessions.activeSeconds,
        createdAt: learningSessions.createdAt,
      })
      .from(learningSessions)
      .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
      .limit(1)
      .for("update");

    if (!session) {
      throw new ValidationError("Không tìm thấy phiên học hoặc phiên không thuộc người dùng.", 404);
    }

    if (isSessionLifecycleEventKind(kind)) {
      // Chỉ pause/resume/finish quyết định đồng hồ. hint/reveal xảy ra giữa
      // chừng không được làm mất trạng thái paused/active của phiên.
      const recentLifecycleEvents = await tx
        .select({ kind: sessionEvents.kind, eventAt: sessionEvents.eventAt })
        .from(sessionEvents)
        .where(
          and(
            eq(sessionEvents.sessionId, sessionId),
            inArray(sessionEvents.kind, ["pause", "resume", "finish"])
          )
        )
        .orderBy(desc(sessionEvents.eventAt))
        .limit(5);

      // Nếu nhiều lifecycle event rơi đúng cùng mốc millisecond (double-submit
      // client/server), ưu tiên finish vì finish là terminal về mặt ngữ nghĩa.
      const latestEventAt = recentLifecycleEvents[0]?.eventAt;
      const lastEvent = latestEventAt
        ? recentLifecycleEvents.find(
            (event) =>
              event.kind === "finish" &&
              new Date(event.eventAt).getTime() === new Date(latestEventAt).getTime()
          ) ?? recentLifecycleEvents[0]
        : undefined;

      const lastLifecycleEvent =
        lastEvent && isSessionLifecycleEventKind(lastEvent.kind)
          ? { kind: lastEvent.kind, eventAt: new Date(lastEvent.eventAt) }
          : null;

      const transition = calculateSessionClockTransition({
        incomingKind: kind,
        currentStatus: session.status,
        currentActiveSeconds: session.activeSeconds,
        sessionCreatedAt: new Date(session.createdAt),
        lastLifecycleEvent,
        now: new Date(),
      });

      await tx
        .update(learningSessions)
        .set({
          activeSeconds: transition.activeSeconds,
          status: transition.nextStatus,
          updatedAt: new Date(),
        })
        .where(eq(learningSessions.id, sessionId));
    }

    const [event] = await tx
      .insert(sessionEvents)
      .values({
        sessionId,
        learnerId,
        kind,
        payload: payload ? (payload as Record<string, unknown>) : null,
      })
      .returning();

    return event;
  });
}
