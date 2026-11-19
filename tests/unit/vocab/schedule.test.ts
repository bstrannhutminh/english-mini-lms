/**
 * Unit test hermetic cho bộ lập lịch SRS của Sổ từ (quyết định D-2):
 *  - ĐẠT: mastery +1 theo khoảng ôn [1, 3, 7, 14, 30] ngày (index = mastery mới)
 *  - TRẦN: mastery tối đa 4 (hiển thị "x/5")
 *  - "partial" = CHƯA ĐẠT: giữ mastery nhưng hẹn ôn SỚM lại (ngày mai),
 *    không bao giờ kéo dài thêm khoảng ôn
 *  - SAI: mastery -1 (sàn 0), ôn lại sau 1 ngày
 */
import { describe, it, expect } from "vitest";
import {
  SPACED_INTERVALS_DAYS,
  MASTERY_MAX,
  clampMastery,
  formatMastery,
  isMastered,
  nextReview,
  calculateNextReview,
} from "@/server/vocabulary/schedule";

const NOW = new Date("2026-10-19T07:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

describe("SRS ladder — đúng bảng 1-3-7-14-30", () => {
  it("khoảng ôn khớp bảng chốt", () => {
    expect([...SPACED_INTERVALS_DAYS]).toEqual([1, 3, 7, 14, 30]);
    expect(MASTERY_MAX).toBe(4);
  });

  it.each([
    { mastery: 0, nextMastery: 1, interval: 3 },
    { mastery: 1, nextMastery: 2, interval: 7 },
    { mastery: 2, nextMastery: 3, interval: 14 },
    { mastery: 3, nextMastery: 4, interval: 30 },
    { mastery: 4, nextMastery: 4, interval: 30 },
  ])(
    "correct: mastery $mastery → $nextMastery, ôn sau $interval ngày",
    ({ mastery, nextMastery, interval }) => {
      const r = nextReview(mastery, "correct", NOW);
      expect(r.nextMastery).toBe(nextMastery);
      expect(r.intervalDays).toBe(interval);
      expect(daysBetween(NOW, r.nextDueAt)).toBe(interval);
    }
  );
});

describe("SRS — incorrect tụt 1 mastery, ôn lại ngày mai", () => {
  it("mastery 3 sai → còn 2, ôn sau 1 ngày", () => {
    const r = nextReview(3, "incorrect", NOW);
    expect(r.nextMastery).toBe(2);
    expect(r.intervalDays).toBe(1);
    expect(daysBetween(NOW, r.nextDueAt)).toBe(1);
  });

  it("mastery 0 sai → giữ sàn 0, ôn sau 1 ngày", () => {
    const r = nextReview(0, "incorrect", NOW);
    expect(r.nextMastery).toBe(0);
    expect(r.intervalDays).toBe(1);
  });
});

describe("SRS — partial = chưa đạt: ôn SỚM, không kéo dài", () => {
  it("giữ nguyên mastery nhưng hẹn ôn lại ngày mai", () => {
    for (const mastery of [0, 1, 2, 3, 4]) {
      const r = nextReview(mastery, "partial", NOW);
      expect(r.nextMastery).toBe(mastery);
      expect(r.intervalDays).toBe(1);
      expect(daysBetween(NOW, r.nextDueAt)).toBe(1);
    }
  });

  it("partial luôn sớm hơn correct ở cùng mastery — never extends", () => {
    for (const mastery of [0, 1, 2, 3, 4]) {
      const partial = nextReview(mastery, "partial", NOW);
      const correct = nextReview(mastery, "correct", NOW);
      expect(partial.nextDueAt.getTime()).toBeLessThan(
        correct.nextDueAt.getTime()
      );
    }
  });
});

describe("SRS — mastery cap 4", () => {
  it("đúng nhiều lần liên tiếp không vượt trần 4", () => {
    let mastery = 0;
    let now = NOW;
    for (let i = 0; i < 8; i++) {
      const r = nextReview(mastery, "correct", now);
      expect(r.nextMastery).toBeLessThanOrEqual(MASTERY_MAX);
      mastery = r.nextMastery;
      now = r.nextDueAt;
    }
    expect(mastery).toBe(4);
  });

  it("dữ liệu cũ mastery 5 được kẹp về 4", () => {
    const r = nextReview(5, "correct", NOW);
    expect(r.nextMastery).toBe(4);
    expect(r.intervalDays).toBe(30);
    expect(clampMastery(5)).toBe(4);
    expect(clampMastery(99)).toBe(4);
    expect(clampMastery(-2)).toBe(0);
  });
});

describe("formatMastery — hiển thị thống nhất x/5", () => {
  it("0→\"0/5\", 3→\"3/5\", 4→\"4/5\", kẹp cả 5→\"4/5\"", () => {
    expect(formatMastery(0)).toBe("0/5");
    expect(formatMastery(3)).toBe("3/5");
    expect(formatMastery(4)).toBe("4/5");
    expect(formatMastery(5)).toBe("4/5");
  });

  it("isMastered chỉ đúng ở trần", () => {
    expect(isMastered(3)).toBe(false);
    expect(isMastered(4)).toBe(true);
    expect(isMastered(5)).toBe(true); // dữ liệu cũ kẹp vẫn tính đã thuộc
  });
});

describe("calculateNextReview — vỏ bọc tương thích chữ ký cũ", () => {
  it("(mastery, isCorrect, isPartial?) khớp nextReview", () => {
    expect(calculateNextReview(0, true, false, NOW)).toEqual(
      nextReview(0, "correct", NOW)
    );
    expect(calculateNextReview(3, false, false, NOW)).toEqual(
      nextReview(3, "incorrect", NOW)
    );
    expect(calculateNextReview(2, true, true, NOW)).toEqual(
      nextReview(2, "partial", NOW)
    );
    // isPartial thắng isCorrect (gọi nhầm cả hai vẫn coi là chưa đạt)
    expect(calculateNextReview(2, false, true, NOW)).toEqual(
      nextReview(2, "partial", NOW)
    );
  });
});
