import { describe, it, expect } from "vitest";
import {
  stableHash,
  staggeredOffsetDays,
  staggeredDueAt,
  seedVocabStaggerKey,
  STAGGER_MIN_DAYS,
  STAGGER_MAX_DAYS,
} from "../../../scripts/vocab-stagger.mjs";

/**
 * Logic rải lịch due_at cho vocab seed (mastery 0): deterministic theo khoá
 * và phủ đều dải 1–10 ngày — tránh ~1.100 từ đến hạn cùng một ngày.
 */
describe("vocab-stagger (rải lịch từ vựng seed)", () => {
  it("stableHash deterministic: cùng input luôn cùng output", () => {
    expect(stableHash("abc")).toBe(stableHash("abc"));
    expect(stableHash("abc")).not.toBe(stableHash("abd"));
    expect(Number.isInteger(stableHash("x"))).toBe(true);
    expect(stableHash("x")).toBeGreaterThanOrEqual(0);
  });

  it("offset luôn nằm trong [minDays, maxDays]", () => {
    for (let i = 0; i < 200; i++) {
      const offset = staggeredOffsetDays(`key-${i}`);
      expect(offset).toBeGreaterThanOrEqual(STAGGER_MIN_DAYS);
      expect(offset).toBeLessThanOrEqual(STAGGER_MAX_DAYS);
      expect(Number.isInteger(offset)).toBe(true);
    }
  });

  it("offset deterministic theo khoá", () => {
    expect(staggeredOffsetDays("learner-1:mitigate")).toBe(
      staggeredOffsetDays("learner-1:mitigate")
    );
  });

  it("phân bố trải đều dải ngày với nhiều từ (không dồn một ngày)", () => {
    const counts = new Map<number, number>();
    // Mô phỏng quy mô thật ~1.100 từ IELTS
    for (let i = 0; i < 1100; i++) {
      const offset = staggeredOffsetDays(seedVocabStaggerKey("learner-x", `word-${i}`));
      counts.set(offset, (counts.get(offset) ?? 0) + 1);
    }
    // Mỗi ngày trong 1..10 phải có ít nhất một từ — không ngày nào trống,
    // và không ngày nào chiếm quá nửa tổng (dồn cục như bug cũ).
    for (let day = STAGGER_MIN_DAYS; day <= STAGGER_MAX_DAYS; day++) {
      expect(counts.get(day) ?? 0).toBeGreaterThan(0);
    }
    for (const [, count] of counts) {
      expect(count).toBeLessThan(550);
    }
  });

  it("staggeredDueAt = now + offset ngày, deterministic theo (key, now)", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const a = staggeredDueAt("k1", now);
    const b = staggeredDueAt("k1", now);
    expect(a.getTime()).toBe(b.getTime());
    const diffDays = Math.round((a.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBeGreaterThanOrEqual(STAGGER_MIN_DAYS);
    expect(diffDays).toBeLessThanOrEqual(STAGGER_MAX_DAYS);
  });

  it("seedVocabStaggerKey phân biệt learner và phrase", () => {
    expect(seedVocabStaggerKey("l1", "word")).not.toBe(seedVocabStaggerKey("l2", "word"));
    expect(seedVocabStaggerKey("l1", "word")).not.toBe(seedVocabStaggerKey("l1", "other"));
  });
});
