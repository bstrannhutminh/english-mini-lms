/**
 * Trạng thái + logic thuần của mode Đọc–dịch.
 * Tách riêng khỏi Panel để test hermetic (không import React/DOM).
 *
 * Draft & submission body dùng chung một payload JSON
 * {mainIdea, translation, keyTerms} — server evaluateReading parse cùng
 * format này (xem assessment.service.ts nhánh reading).
 */
import type { SessionData, SubmissionInput, SubmitCheck } from "../types";

export interface ReadingModeState {
  /** Ý chính của đoạn (1–2 câu, tuỳ chọn). */
  mainIdea: string;
  /** Bản dịch tiếng Việt — trường bắt buộc để nộp. */
  translation: string;
  /** Ba thuật ngữ tự giải thích (tuỳ chọn). */
  keyTerms: string;
  /** Mở rộng khung đối chiếu Bản 1 (luồng revision). */
  showParentRef: boolean;
}

export interface ReadingPayload {
  mainIdea: string;
  translation: string;
  keyTerms: string;
}

/**
 * Parse nội dung draft/body bản cha: chấp nhận JSON {mainIdea, translation,
 * keyTerms} hoặc plain text (coi như bản dịch) — port nguyên semantics từ
 * reading-session-view cũ.
 */
export function parseReadingPayload(raw: string | null | undefined): ReadingPayload {
  const empty: ReadingPayload = { mainIdea: "", translation: "", keyTerms: "" };
  if (!raw) return empty;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const p = parsed as Record<string, unknown>;
      return {
        mainIdea: typeof p.mainIdea === "string" ? p.mainIdea : "",
        translation: typeof p.translation === "string" ? p.translation : "",
        keyTerms: typeof p.keyTerms === "string" ? p.keyTerms : "",
      };
    }
  } catch {
    // Không phải JSON → coi toàn bộ là bản dịch
  }
  return { ...empty, translation: raw };
}

/** Serialize payload để lưu nháp / nộp bài. */
export function serializeReadingPayload(payload: ReadingPayload): string {
  return JSON.stringify({
    mainIdea: payload.mainIdea.trim(),
    translation: payload.translation.trim(),
    keyTerms: payload.keyTerms.trim(),
  });
}

/** Draft ưu tiên trước; khi sửa lại và chưa có draft → nạp sẵn từ body bản cha. */
export function initialReadingState(data: SessionData): ReadingModeState {
  const source = data.initialDraft || data.parentData?.submission.body || "";
  const parsed = parseReadingPayload(source);
  return {
    ...parsed,
    showParentRef: Boolean(data.parentData),
  };
}

export function canSubmitReading(state: ReadingModeState): SubmitCheck {
  return state.translation.trim()
    ? { ok: true }
    : { ok: false, reason: "Vui lòng nhập bản dịch tiếng Việt trước khi nộp bài." };
}

export function buildReadingSubmission(state: ReadingModeState): SubmissionInput {
  return { body: serializeReadingPayload(state) };
}

/** Trả "" khi cả 3 ô đều trống → hook autosave bỏ qua. */
export function buildReadingDraft(state: ReadingModeState): string {
  if (!state.mainIdea.trim() && !state.translation.trim() && !state.keyTerms.trim()) {
    return "";
  }
  return serializeReadingPayload(state);
}
