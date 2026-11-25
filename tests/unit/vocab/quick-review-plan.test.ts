import { describe, expect, it } from "vitest";
import {
  planQuickReviewBatch,
  finalVaultStates,
  type QuickReviewVocabState,
} from "@/server/vocabulary/quick-review-plan";
import { SPACED_INTERVALS_DAYS } from "@/lib/vocabulary-schedule";

const NOW = new Date("2026-01-10T00:00:00Z");

function vocab(id: string, masteryLevel: number): QuickReviewVocabState {
  return { id, phrase: `phrase-${id}`, masteryLevel };
}

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
}

describe("planQuickReviewBatch", () => {
  it("know → tăng 1 mastery và hẹn theo thang 1-3-7-14-30", () => {
    const plans = planQuickReviewBatch(
      [{ vocab_id: "a", result: "know" }],
      new Map([["a", vocab("a", 1)]]),
      NOW
    );
    expect(plans).toHaveLength(1);
    expect(plans[0].nextMastery).toBe(2);
    expect(plans[0].intervalDays).toBe(SPACED_INTERVALS_DAYS[2]); // 7
    expect(plans[0].nextDueAt.getTime()).toBe(daysFromNow(7).getTime());
  });

  it("dont_know → giảm 1 mastery (sàn 0), ôn lại sau 1 ngày", () => {
    const plans = planQuickReviewBatch(
      [{ vocab_id: "a", result: "dont_know" }],
      new Map([["a", vocab("a", 0)]]),
      NOW
    );
    expect(plans[0].nextMastery).toBe(0);
    expect(plans[0].nextDueAt.getTime()).toBe(daysFromNow(1).getTime());
  });

  it("bỏ qua item có vocab không tồn tại (không entry trong plan)", () => {
    const plans = planQuickReviewBatch(
      [
        { vocab_id: "missing", result: "know" },
        { vocab_id: "a", result: "know" },
      ],
      new Map([["a", vocab("a", 0)]]),
      NOW
    );
    expect(plans).toHaveLength(1);
    expect(plans[0].vocabId).toBe("a");
  });

  it("cùng một từ hai lần trong batch → compounding như vòng lặp tuần tự cũ", () => {
    const plans = planQuickReviewBatch(
      [
        { vocab_id: "a", result: "know" },
        { vocab_id: "a", result: "know" },
      ],
      new Map([["a", vocab("a", 0)]]),
      NOW
    );
    // Lần 1: 0 → 1 (hẹn 3 ngày); lần 2 tính trên mastery 1 → 2 (hẹn 7 ngày).
    expect(plans[0].nextMastery).toBe(1);
    expect(plans[1].nextMastery).toBe(2);
    expect(plans[1].intervalDays).toBe(SPACED_INTERVALS_DAYS[2]);
  });

  it("giữ thứ tự input và kèm clientReviewId", () => {
    const plans = planQuickReviewBatch(
      [
        { vocab_id: "b", result: "dont_know", clientReviewId: "r2" },
        { vocab_id: "a", result: "know", clientReviewId: "r1" },
      ],
      new Map([
        ["a", vocab("a", 0)],
        ["b", vocab("b", 3)],
      ]),
      NOW
    );
    expect(plans.map((p) => p.vocabId)).toEqual(["b", "a"]);
    expect(plans.map((p) => p.clientReviewId)).toEqual(["r2", "r1"]);
  });
});

describe("finalVaultStates", () => {
  const plans = planQuickReviewBatch(
    [
      { vocab_id: "a", result: "know" },
      { vocab_id: "b", result: "dont_know" },
    ],
    new Map([
      ["a", vocab("a", 0)],
      ["b", vocab("b", 3)],
    ]),
    NOW
  );

  it("trạng thái cuối theo từng từ khi không có duplicate", () => {
    const states = finalVaultStates(plans, [false, false]);
    expect(states.get("a")?.masteryLevel).toBe(1);
    expect(states.get("b")?.masteryLevel).toBe(2);
    expect(states.get("b")?.intervalDays).toBe(1);
  });

  it("duplicate bị loại khỏi cập nhật vault — tuyệt đối không advance mastery", () => {
    const states = finalVaultStates(plans, [true, false]);
    expect(states.has("a")).toBe(false);
    expect(states.has("b")).toBe(true);
  });

  it("nhiều item cùng từ: item cuối không duplicate quyết định trạng thái cuối", () => {
    const multi = planQuickReviewBatch(
      [
        { vocab_id: "a", result: "know" },
        { vocab_id: "a", result: "know" },
      ],
      new Map([["a", vocab("a", 0)]]),
      NOW
    );
    // Item đầu là duplicate (retry), item sau áp dụng — trạng thái cuối theo item sau.
    const states = finalVaultStates(multi, [true, false]);
    expect(states.get("a")?.masteryLevel).toBe(2);
  });
});
