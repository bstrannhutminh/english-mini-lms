/**
 * Helpers hiển thị thang mastery cho UI Sổ từ — NGUỒN DUY NHẤT cho
 * định dạng "x/5", trạng thái đến hạn/đã thuộc trên mọi màn vocab.
 * Các hằng/hàm lõi nằm ở server/vocabulary/schedule.ts (module thuần,
 * không import db/env nên bundle phía client an toàn).
 */
import {
  MASTERY_MAX,
  clampMastery,
  formatMastery,
  isMastered,
} from "@/server/vocabulary/schedule";

export { MASTERY_MAX, clampMastery, formatMastery, isMastered };

export type DueState = "due" | "scheduled" | "mastered";

/** Trạng thái ôn của 1 từ — đến hạn khi dueAt <= now (mọi mastery). */
export function dueState(
  item: { masteryLevel: number; dueAt: string | Date },
  now: Date = new Date()
): DueState {
  if (isMastered(item.masteryLevel)) return "mastered";
  return new Date(item.dueAt) <= now ? "due" : "scheduled";
}

/** Từ cần ôn ngay: dueAt <= now và chưa đạt trần mastery. */
export function isDueNow(
  item: { masteryLevel: number; dueAt: string | Date },
  now: Date = new Date()
): boolean {
  return !isMastered(item.masteryLevel) && new Date(item.dueAt) <= now;
}

/** Số ngày tới kỳ ôn kế tiếp (âm/0 = đã đến hạn). */
export function daysUntilDue(dueAt: string | Date, now: Date = new Date()): number {
  const diffMs = new Date(dueAt).getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
