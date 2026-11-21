import type { PracticeScore } from "@/contracts/submission";

/** Thang điểm ước tính luyện tập do provider quy định (0–10). */
export const PRACTICE_SCALE_MAX = 10;

export interface PracticeEstimateSummary {
  /** Trung bình các tiêu chí, làm tròn 1 chữ số. */
  average: number;
  /** Thang điểm dùng để vẽ vòng/thanh. */
  max: number;
  /** Số tiêu chí được tính. */
  count: number;
}

/** Thang hiển thị: 10 theo provider; dữ liệu cũ vượt 10 thì coi là thang 100. */
export function practiceScaleMax(scores: readonly PracticeScore[]): number {
  return scores.some((s) => s.value > PRACTICE_SCALE_MAX) ? 100 : PRACTICE_SCALE_MAX;
}

/** Hiển thị số gọn: 8 → "8", 7.75 → "7.8". */
export function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Tóm tắt điểm ƯỚC TÍNH LUYỆN TẬP (không phải band chính thức): trung bình
 * cộng các tiêu chí hợp lệ. Không có điểm → null để UI bỏ vòng điểm.
 */
export function summarizePracticeEstimate(
  scores: readonly PracticeScore[] | null | undefined
): PracticeEstimateSummary | null {
  const valid = (scores ?? []).filter((s) => Number.isFinite(s.value));
  if (valid.length === 0) return null;
  const total = valid.reduce((sum, s) => sum + s.value, 0);
  return {
    average: Math.round((total / valid.length) * 10) / 10,
    max: practiceScaleMax(valid),
    count: valid.length,
  };
}
