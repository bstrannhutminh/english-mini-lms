/**
 * Plugin mode Đọc–dịch — port từ reading-session-view.tsx.
 * Giữ nguyên: payload JSON {mainIdea, translation, keyTerms} cho draft và
 * submission (server evaluateReading parse cùng format), chỉ bắt buộc bản
 * dịch, Smart Capture trên đoạn gốc. ĐÃ BỎ đoạn văn giả "Trang 42" — thiếu
 * segment hiện EmptyState tiếng Việt.
 */
import type { ModePlugin, SessionData } from "../types";
import { ReadingPanel } from "./reading-panel";
import { ReadingHint } from "./reading-hint";
import {
  initialReadingState,
  canSubmitReading,
  buildReadingSubmission,
  buildReadingDraft,
  type ReadingModeState,
} from "./state";

export const readingPlugin: ModePlugin = {
  skill: "reading",
  Panel: ReadingPanel,
  initialState: (data: SessionData) => initialReadingState(data),
  canSubmit: (state) => canSubmitReading(state as ReadingModeState),
  buildSubmission: (state) => buildReadingSubmission(state as ReadingModeState),
  buildDraft: (state) => buildReadingDraft(state as ReadingModeState),
  Hint: ReadingHint,
  hintLabel: "Xin gợi ý cách dịch",
  submittingCopy: {
    title: "Gemini đang đọc bản dịch và đối chiếu đoạn gốc...",
    description:
      "Đang đánh giá độ trung thành, thuật ngữ y khoa và cách diễn đạt theo rubric. Quá trình mất khoảng 15–30 giây.",
  },
};
