/**
 * Plugin mode Viết — port từ writing-session-view.tsx.
 * Giữ nguyên: nạp nháp + nạp body bản cha khi sửa lại, đếm từ 120–150,
 * gợi ý ghi event hint (assisted do server tính), nộp tạo submission mới
 * (append-only, parentId nối bản sửa — shell tự thêm parentId).
 */
import type { ModePlugin, SessionData, SubmitCheck } from "../types";
import { WritingPanel } from "./writing-panel";
import { WritingHint } from "./writing-hint";
import type { WritingModeState } from "./state";

function initialState(data: SessionData): WritingModeState {
  return {
    text: data.initialDraft || data.parentData?.submission.body || "",
    showParentRef: Boolean(data.parentData),
  };
}

function canSubmit(state: unknown): SubmitCheck {
  const { text } = state as WritingModeState;
  return text.trim()
    ? { ok: true }
    : { ok: false, reason: "Vui lòng viết bài trước khi nộp." };
}

export const writingPlugin: ModePlugin = {
  skill: "writing",
  Panel: WritingPanel,
  initialState,
  canSubmit,
  buildSubmission: (state) => ({ body: (state as WritingModeState).text }),
  buildDraft: (state) => (state as WritingModeState).text,
  Hint: WritingHint,
  hintLabel: "Xin gợi ý dàn bài",
  submittingCopy: {
    title: "Gemini đang đọc và chấm bài của bạn...",
    description:
      "Đang phân tích độ rõ, ngữ pháp, tính trang trọng và cấu trúc theo rubric. Quá trình mất khoảng 15–30 giây.",
  },
};
