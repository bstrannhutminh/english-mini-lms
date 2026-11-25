/**
 * Bộ lập lịch Spaced Repetition DUY NHẤT của Sổ từ (quyết định D-2).
 * Thuần (pure), không import db/env → unit-test hermetic và client cũng
 * dùng được các hằng/hàm format.
 *
 * Luật (invariant, đừng đổi nếu không duyệt lại):
 *  - Thang mastery 0–4, luôn HIỂN THỊ "x/5" (xem formatMastery).
 *  - Khoảng ôn khi ĐẠT theo mastery mới: [1, 3, 7, 14, 30] ngày.
 *    Từ mới tạo bắt đầu mastery 0, đến hạn sau 1 ngày (createVocabulary).
 *  - "partial" (tạm được) = CHƯA ĐẠT: giữ nguyên mastery nhưng hẹn ôn
 *    sớm lại vào ngày mai — không bao giờ được kéo dài thêm khoảng ôn.
 *  - "incorrect": giảm 1 mastery (sàn 0), ôn lại sau 1 ngày.
 */

/** Ngày ôn kế tiếp theo mastery đạt được (index = mastery 0..4). */
export const SPACED_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

/** Mastery tối đa trong thang 0–4 (hiển thị "{mastery}/5"). */
export const MASTERY_MAX = SPACED_INTERVALS_DAYS.length - 1; // 4

/** Ngày hiển thị trên mọi màn: mastery 0–4 → "x/5". */
export const MASTERY_SCALE = 5;

/** Kết quả một lượt ôn — flashcard "know"→correct, "dont_know"→incorrect. */
export type ReviewOutcome = "correct" | "partial" | "incorrect";

export interface NextReview {
  nextMastery: number;
  nextDueAt: Date;
  intervalDays: number;
}

/** Kẹp mastery trong [0, MASTERY_MAX] — dữ liệu cũ có thể lưu 5. */
export function clampMastery(mastery: number): number {
  if (!Number.isFinite(mastery)) return 0;
  return Math.min(MASTERY_MAX, Math.max(0, Math.trunc(mastery)));
}

/** true khi từ đã "thuộc" (mastery đạt trần 4/5). */
export function isMastered(mastery: number): boolean {
  return clampMastery(mastery) >= MASTERY_MAX;
}

/** Nhãn mastery thống nhất toàn app: "0/5" … "4/5". */
export function formatMastery(mastery: number): string {
  return `${clampMastery(mastery)}/${MASTERY_SCALE}`;
}

function addDays(now: Date, days: number): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Tính lịch ôn kế tiếp. `now` inject được để unit-test deterministic.
 *
 * @param currentMastery mastery hiện tại (kẹp vào 0–4).
 * @param outcome        "correct" | "partial" | "incorrect".
 */
export function nextReview(
  currentMastery: number,
  outcome: ReviewOutcome,
  now: Date = new Date()
): NextReview {
  const mastery = clampMastery(currentMastery);

  if (outcome === "correct") {
    const nextMastery = Math.min(MASTERY_MAX, mastery + 1);
    const intervalDays = SPACED_INTERVALS_DAYS[nextMastery];
    return { nextMastery, nextDueAt: addDays(now, intervalDays), intervalDays };
  }

  if (outcome === "partial") {
    // Chưa đạt → giữ mastery nhưng ôn sớm lại ngày mai (không kéo dài mốc).
    return { nextMastery: mastery, nextDueAt: addDays(now, 1), intervalDays: 1 };
  }

  // incorrect → tụt 1 mastery (sàn 0), ôn lại sau 1 ngày.
  const nextMastery = Math.max(0, mastery - 1);
  return { nextMastery, nextDueAt: addDays(now, 1), intervalDays: 1 };
}

/**
 * Vỏ bọc tương thích với chữ ký cũ (isCorrect/isPartial) — test tích hợp
 * và code cũ vẫn gọi được. Code mới dùng nextReview(mastery, outcome).
 */
export function calculateNextReview(
  currentMastery: number,
  isCorrect: boolean,
  isPartial = false,
  now: Date = new Date()
): NextReview {
  const outcome: ReviewOutcome = isPartial
    ? "partial"
    : isCorrect
      ? "correct"
      : "incorrect";
  return nextReview(currentMastery, outcome, now);
}
