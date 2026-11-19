/**
 * INVARIANT — thuật toán học thuần (pure):
 *  - SRS nextReview: thang 0–4, bảng [1,3,7,14,30], partial không kéo
 *    dài mốc ôn, incorrect tụt 1 (sàn 0). Hiển thị luôn "x/5".
 *  - buildDailyPlan: Ôn từ đến hạn luôn là bước đầu; ngân sách 30' vs 45'
 *    khác nhau đúng bảng; bước Sửa deep-link tới bản chờ khi có parent.
 */
import { describe, expect, it } from "vitest";
import {
  formatMastery,
  nextReview,
  SPACED_INTERVALS_DAYS,
} from "@/server/vocabulary/schedule";
import {
  buildDailyPlan,
  type DailyPlanContext,
} from "@/server/today/daily-plan";

const NOW = new Date("2026-10-20T02:00:00.000Z");

describe("nextReview — bảng SRS [1,3,7,14,30]", () => {
  it("correct: mastery+1 (trần 4), mốc ôn theo mastery MỚI", () => {
    // mastery 0 → 1 → +3d ; 1 → 2 → +7d ; 2 → 3 → +14d ; 3 → 4 → +30d ; 4 → 4 → +30d
    const cases: Array<[number, number, number]> = [
      [0, 1, 3],
      [1, 2, 7],
      [2, 3, 14],
      [3, 4, 30],
      [4, 4, 30],
    ];
    for (const [from, toMastery, days] of cases) {
      const r = nextReview(from, "correct", NOW);
      expect(r.nextMastery).toBe(toMastery);
      expect(r.intervalDays).toBe(days);
      expect(r.intervalDays).toBe(SPACED_INTERVALS_DAYS[toMastery]);
      expect(r.nextDueAt.getTime()).toBe(
        NOW.getTime() + days * 24 * 60 * 60 * 1000
      );
    }
  });

  it("partial: GIỮ mastery, hẹn lại ngày mai — không bao giờ kéo dài mốc ôn", () => {
    for (const m of [0, 2, 4]) {
      const r = nextReview(m, "partial", NOW);
      expect(r.nextMastery).toBe(m);
      expect(r.intervalDays).toBe(1);
    }
  });

  it("incorrect: tụt 1 mastery (sàn 0), ôn lại sau 1 ngày", () => {
    expect(nextReview(3, "incorrect", NOW)).toMatchObject({
      nextMastery: 2,
      intervalDays: 1,
    });
    expect(nextReview(0, "incorrect", NOW)).toMatchObject({
      nextMastery: 0,
      intervalDays: 1,
    });
  });

  it("kẹp mastery lạ (5, -1, NaN) về thang 0–4 trước khi tính", () => {
    expect(nextReview(5, "correct", NOW).nextMastery).toBe(4);
    expect(nextReview(-1, "incorrect", NOW).nextMastery).toBe(0);
    expect(nextReview(Number.NaN, "correct", NOW).nextMastery).toBe(1);
  });
});

describe("formatMastery — nhãn thống nhất x/5", () => {
  it("0–4 → '0/5'…'4/5', kẹp ngoài miền", () => {
    expect(formatMastery(0)).toBe("0/5");
    expect(formatMastery(2)).toBe("2/5");
    expect(formatMastery(4)).toBe("4/5");
    expect(formatMastery(5)).toBe("4/5");
  });
});

function ctx(overrides: Partial<DailyPlanContext> = {}): DailyPlanContext {
  return {
    dueVocabCount: 0,
    inProgressSessionId: null,
    recommendedActivityId: "W1",
    submittedToday: false,
    revisedToday: false,
    unrevisedSubmissionId: null,
    ...overrides,
  };
}

describe("buildDailyPlan — thứ tự bước & ngân sách", () => {
  it("thứ tự cố định: warmup → main → revise → wrapup", () => {
    const plan = buildDailyPlan(ctx(), 30);
    expect(plan.map((s) => s.key)).toEqual([
      "warmup",
      "main",
      "revise",
      "wrapup",
    ]);
  });

  it("từ đến hạn > 0 → warmup là bước current đầu tiên, deep-link flashcards", () => {
    const plan = buildDailyPlan(ctx({ dueVocabCount: 7 }), 30);
    expect(plan[0].key).toBe("warmup");
    expect(plan[0].status).toBe("current");
    expect(plan[0].href).toBe("/vocab/flashcards");
    expect(plan[0].description).toContain("7");
  });

  it("ngân sách 30' vs 45' khác nhau đúng bảng, tổng = target", () => {
    const p30 = buildDailyPlan(ctx(), 30);
    const p45 = buildDailyPlan(ctx(), 45);
    const mins = (p: typeof p30) =>
      Object.fromEntries(p.map((s) => [s.key, s.estimatedMinutes]));

    expect(mins(p30)).toEqual({ warmup: 5, main: 15, revise: 8, wrapup: 2 });
    expect(mins(p45)).toEqual({ warmup: 5, main: 22, revise: 15, wrapup: 3 });
    for (const [plan, target] of [
      [p30, 30],
      [p45, 45],
    ] as const) {
      expect(plan.reduce((sum, s) => sum + s.estimatedMinutes, 0)).toBe(target);
    }
  });

  it("có bản 1 chờ sửa → bước revise deep-link /my-work/[id] và chưa done", () => {
    const plan = buildDailyPlan(
      ctx({ submittedToday: true, unrevisedSubmissionId: "sub-9" }),
      30
    );
    const revise = plan.find((s) => s.key === "revise")!;
    expect(revise.href).toBe("/my-work/sub-9");
    expect(revise.status).toBe("current"); // main xong → revise là việc kế tiếp
  });

  it("phiên đang dở → bước main link thẳng /learn/[id]", () => {
    const plan = buildDailyPlan(ctx({ inProgressSessionId: "sess-5" }), 30);
    expect(plan.find((s) => s.key === "main")!.href).toBe("/learn/sess-5");
  });
});
