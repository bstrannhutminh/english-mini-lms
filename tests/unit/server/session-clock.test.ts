import { describe, expect, it } from "vitest";
import { calculateSessionClockTransition } from "@/server/learning/session/session-clock";

const t0 = new Date("2026-01-01T08:00:00.000Z");
const plus = (seconds: number) => new Date(t0.getTime() + seconds * 1000);

function transition(
  incomingKind: "pause" | "resume" | "finish",
  overrides: Partial<Parameters<typeof calculateSessionClockTransition>[0]> = {}
) {
  return calculateSessionClockTransition({
    incomingKind,
    currentStatus: "active",
    currentActiveSeconds: 0,
    sessionCreatedAt: t0,
    lastLifecycleEvent: null,
    now: plus(600),
    ...overrides,
  });
}

describe("session active-time state machine", () => {
  it("event pause đầu tiên đếm từ created_at của session", () => {
    const result = transition("pause");
    expect(result).toMatchObject({
      activeSeconds: 600,
      countedSeconds: 600,
      nextStatus: "paused",
    });
  });

  it("pause lặp là no-op, không double-count", () => {
    const result = transition("pause", {
      currentStatus: "paused",
      currentActiveSeconds: 600,
      lastLifecycleEvent: { kind: "pause", eventAt: plus(600) },
      now: plus(1800),
    });
    expect(result.activeSeconds).toBe(600);
    expect(result.countedSeconds).toBe(0);
  });

  it("resume → finish chỉ cộng đoạn đang active", () => {
    const result = transition("finish", {
      currentActiveSeconds: 600,
      lastLifecycleEvent: { kind: "resume", eventAt: plus(1000) },
      now: plus(1600),
    });
    expect(result).toMatchObject({
      activeSeconds: 1200,
      countedSeconds: 600,
      nextStatus: "completed",
    });
  });

  it("finish là terminal: event đến muộn không cộng thêm và không mở lại phiên", () => {
    const base = {
      currentStatus: "completed",
      currentActiveSeconds: 900,
      lastLifecycleEvent: { kind: "finish" as const, eventAt: plus(900) },
      now: plus(3600),
    };
    expect(transition("pause", base).activeSeconds).toBe(900);
    expect(transition("resume", base)).toMatchObject({
      activeSeconds: 900,
      nextStatus: "completed",
    });
  });

  it("legacy completed chưa có finish vẫn chốt được đoạn đang chạy nhưng không đổi thành paused", () => {
    const result = transition("pause", {
      currentStatus: "completed",
      sessionCreatedAt: t0,
      now: plus(300),
    });
    expect(result).toMatchObject({
      activeSeconds: 300,
      nextStatus: "completed",
    });
  });

  it("pause khi session đã paused từ trước và chưa có lifecycle event không bịa mốc thời gian", () => {
    const result = transition("pause", {
      currentStatus: "paused",
      now: plus(900),
    });
    expect(result.activeSeconds).toBe(0);
    expect(result.countedSeconds).toBe(0);
  });
});
