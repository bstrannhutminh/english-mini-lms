import { describe, it, expect } from "vitest";
import {
  checkRetryAllowed,
  isAssessmentStuck,
} from "@/server/learning/assessment/assessment-status";
import {
  MAX_ASSESSMENT_ATTEMPTS,
  STUCK_ASSESSMENT_MS,
} from "@/server/learning/limits";

describe("isAssessmentStuck — sweeper predicate", () => {
  const now = Date.now();
  const at = (msAgo: number) => new Date(now - msAgo);

  it("processing mới (< ngưỡng) → chưa kẹt", () => {
    expect(
      isAssessmentStuck(
        { status: "processing", updatedAt: at(STUCK_ASSESSMENT_MS - 1000) },
        now
      )
    ).toBe(false);
  });

  it("processing quá 2× timeout → kẹt (cần sweep)", () => {
    expect(
      isAssessmentStuck(
        { status: "processing", updatedAt: at(STUCK_ASSESSMENT_MS + 1) },
        now
      )
    ).toBe(true);
  });

  it("queued quá hạn cũng bị coi là kẹt (insert rồi chết giữa chừng)", () => {
    expect(
      isAssessmentStuck({ status: "queued", updatedAt: at(STUCK_ASSESSMENT_MS + 60_000) }, now)
    ).toBe(true);
  });

  it("feedback_ready / failed / needs_input → không bao giờ kẹt", () => {
    for (const status of ["feedback_ready", "failed", "needs_input"] as const) {
      expect(
        isAssessmentStuck({ status, updatedAt: at(999_999_999) }, now)
      ).toBe(false);
    }
  });
});

describe("checkRetryAllowed — guard trạng thái + giới hạn", () => {
  it("failed + runVersion thấp → cho phép", () => {
    expect(checkRetryAllowed({ status: "failed", runVersion: 1 })).toEqual({ ok: true });
    expect(checkRetryAllowed({ status: "failed", runVersion: MAX_ASSESSMENT_ATTEMPTS - 1 })).toEqual({ ok: true });
  });

  it("feedback_ready → 409, không được chấm lại bài đã chấm xong", () => {
    const v = checkRetryAllowed({ status: "feedback_ready", runVersion: 1 });
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.statusCode).toBe(409);
      expect(v.message).toContain("đã được chấm");
    }
  });

  it("queued / processing (còn hạn sau sweeper) / needs_input → 409 đang chấm", () => {
    for (const status of ["queued", "processing", "needs_input"] as const) {
      const v = checkRetryAllowed({ status, runVersion: 1 });
      expect(v.ok, status).toBe(false);
      if (!v.ok) expect(v.statusCode).toBe(409);
    }
  });

  it("failed nhưng runVersion ≥ cap → 422 hết lượt", () => {
    const v = checkRetryAllowed({ status: "failed", runVersion: MAX_ASSESSMENT_ATTEMPTS });
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.statusCode).toBe(422);
      expect(v.message).toContain(String(MAX_ASSESSMENT_ATTEMPTS));
    }
  });

  it("thứ tự guard: status được xét trước cap", () => {
    // processing với runVersion cao vẫn báo "đang chấm" (409), không báo hết lượt
    const v = checkRetryAllowed({ status: "processing", runVersion: 99 });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.statusCode).toBe(409);
  });
});
