import { describe, it, expect } from "vitest";
import {
  computeRemainingFromPersisted,
  timerStorageKey,
} from "@/features/session/hooks/timer-storage";

describe("Session timer persistence helpers", () => {
  it("scopes storage key per sessionId", () => {
    expect(timerStorageKey("abc")).toBe("lms:session-timer:abc");
    expect(timerStorageKey("abc")).not.toBe(timerStorageKey("xyz"));
  });

  it("subtracts elapsed wall-clock time while timer is active", () => {
    const start = 1_700_000_000_000;
    const res = computeRemainingFromPersisted(
      {
        deadlineMs: start + 1800 * 1000,
        remainingSeconds: 1800,
        paused: false,
      },
      start + 300 * 1000
    );
    expect(res).toEqual({ secondsRemaining: 1500, paused: false });
  });

  it("clamps expired running timer to 0", () => {
    const start = 1_700_000_000_000;
    const res = computeRemainingFromPersisted(
      {
        deadlineMs: start + 60 * 1000,
        remainingSeconds: 60,
        paused: false,
      },
      start + 900 * 1000
    );
    expect(res).toEqual({ secondsRemaining: 0, paused: false });
  });

  it("preserves exact remaining time when paused across long interruptions", () => {
    const start = 1_700_000_000_000;
    const res = computeRemainingFromPersisted(
      {
        deadlineMs: null,
        remainingSeconds: 742,
        paused: true,
      },
      start + 3600 * 1000
    );
    expect(res).toEqual({ secondsRemaining: 742, paused: true });
  });
});
