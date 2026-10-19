import { describe, it, expect } from "vitest";
import {
  buildDailyPlan,
  startOfTodayVietnam,
  type DailyPlanContext,
} from "@/server/today/daily-plan";

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

describe("buildDailyPlan (pure, no DB)", () => {
  it("always returns the 4 fixed steps in order", () => {
    const plan = buildDailyPlan(ctx(), 30);
    expect(plan.map((s) => s.key)).toEqual([
      "warmup",
      "main",
      "revise",
      "wrapup",
    ]);
  });

  it("minute budgets add up to the target (30' and 45')", () => {
    for (const target of [30, 45] as const) {
      const plan = buildDailyPlan(ctx(), target);
      const total = plan.reduce((acc, s) => acc + s.estimatedMinutes, 0);
      expect(total).toBe(target);
    }
    const plan30 = buildDailyPlan(ctx(), 30);
    expect(plan30.find((s) => s.key === "warmup")?.estimatedMinutes).toBe(5);
    expect(plan30.find((s) => s.key === "main")?.estimatedMinutes).toBe(15);
    const plan45 = buildDailyPlan(ctx(), 45);
    expect(plan45.find((s) => s.key === "main")?.estimatedMinutes).toBe(22);
  });

  it("every step is a deep-link and carries a Vietnamese reason", () => {
    const plan = buildDailyPlan(ctx(), 30);
    for (const step of plan) {
      expect(step.href).toBeTruthy();
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it("warmup is done when nothing is due; current when vocab is due", () => {
    const noDue = buildDailyPlan(ctx({ dueVocabCount: 0 }), 30);
    expect(noDue.find((s) => s.key === "warmup")?.status).toBe("done");

    const due = buildDailyPlan(ctx({ dueVocabCount: 7 }), 30);
    const warmup = due.find((s) => s.key === "warmup");
    expect(warmup?.status).toBe("current");
    expect(warmup?.description).toContain("7 từ đến hạn");
    expect(warmup?.href).toBe("/vocab/flashcards");
  });

  it("first unfinished step is 'current', later ones are 'upcoming'", () => {
    // Fresh day: vocab due + nothing submitted → warmup current, rest upcoming.
    const plan = buildDailyPlan(ctx({ dueVocabCount: 3 }), 30);
    const statuses = plan.map((s) => s.status);
    expect(statuses).toEqual(["current", "upcoming", "upcoming", "upcoming"]);

    // Vocab done, main not submitted → main is current.
    const plan2 = buildDailyPlan(ctx(), 30);
    expect(plan2.find((s) => s.key === "warmup")?.status).toBe("done");
    expect(plan2.find((s) => s.key === "main")?.status).toBe("current");
    expect(plan2.find((s) => s.key === "revise")?.status).toBe("upcoming");
  });

  it("main step links to the in-flight session (1 tap to continue)", () => {
    const plan = buildDailyPlan(
      ctx({ inProgressSessionId: "sess-123" }),
      30
    );
    const main = plan.find((s) => s.key === "main");
    expect(main?.href).toBe("/learn/sess-123");
    expect(main?.description).toContain("đang dở");
  });

  it("main step deep-links to the recommended activity, else the library", () => {
    const plan = buildDailyPlan(ctx({ recommendedActivityId: "R2" }), 30);
    expect(plan.find((s) => s.key === "main")?.href).toBe("/library/R2");

    const empty = buildDailyPlan(
      ctx({ recommendedActivityId: null }),
      30
    );
    expect(empty.find((s) => s.key === "main")?.href).toBe("/library");
  });

  it("revise step points at the pending Bản 1 in /my-work", () => {
    const plan = buildDailyPlan(
      ctx({ submittedToday: true, unrevisedSubmissionId: "sub-9" }),
      45
    );
    const revise = plan.find((s) => s.key === "revise");
    expect(revise?.status).not.toBe("done");
    expect(revise?.href).toBe("/my-work/sub-9");
    expect(revise?.description).toContain("Bản 1");
  });

  it("marks revise done when nothing is pending and work was submitted", () => {
    const plan = buildDailyPlan(
      ctx({ submittedToday: true, revisedToday: true }),
      30
    );
    expect(plan.find((s) => s.key === "revise")?.status).toBe("done");
    expect(plan.find((s) => s.key === "wrapup")?.status).toBe("done");
  });

  it("a revision submitted today does not clear a still-pending Bản 1", () => {
    const plan = buildDailyPlan(
      ctx({
        submittedToday: true,
        revisedToday: true,
        unrevisedSubmissionId: "sub-old",
      }),
      30
    );
    expect(plan.find((s) => s.key === "revise")?.status).not.toBe("done");
  });

  it("fully done plan when warmup clear + submitted + nothing to revise", () => {
    const plan = buildDailyPlan(
      ctx({ dueVocabCount: 0, submittedToday: true }),
      30
    );
    expect(plan.every((s) => s.status === "done")).toBe(true);
  });
});

describe("startOfTodayVietnam", () => {
  it("returns 00:00 Asia/Ho_Chi_Minh (fixed UTC+7, no DST)", () => {
    // 2026-10-19T16:00Z = 23:00 VN same day → boundary 17:00Z of the 18th.
    const b1 = startOfTodayVietnam(new Date("2026-10-19T16:00:00Z"));
    expect(b1.toISOString()).toBe("2026-10-18T17:00:00.000Z");

    // 2026-10-19T18:00Z = 2026-10-20 01:00 VN → boundary is the 19th 17:00Z.
    const b2 = startOfTodayVietnam(new Date("2026-10-19T18:00:00Z"));
    expect(b2.toISOString()).toBe("2026-10-19T17:00:00.000Z");
  });
});
