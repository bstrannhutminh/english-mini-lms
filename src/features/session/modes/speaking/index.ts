/**
 * Plugin mode Nói — port từ speaking-session-view.tsx.
 * Giữ nguyên: ghi âm qua MediaRecorder (useRecorder), nghe lại/thu lại
 * trước khi nộp, upload POST /api/v1/media → mediaId kèm submission,
 * gợi ý ghi event hint (assisted do server tính), parent-feedback cho
 * luồng revision. Thêm: đường nộp text-only khi micro không khả dụng
 * (server ghi pronunciation not_assessable) + nháp ghi chú tự lưu.
 */
import type { ModePlugin, SessionData } from "../types";
import { SpeakingPanel } from "./speaking-panel";
import { SpeakingHint } from "./speaking-hint";
import {
  initialSpeakingState,
  canSubmitSpeaking,
  buildSpeakingSubmission,
  buildSpeakingDraft,
  type SpeakingModeState,
} from "./state";

export const speakingPlugin: ModePlugin = {
  skill: "speaking",
  Panel: SpeakingPanel,
  initialState: (data: SessionData) => initialSpeakingState(data),
  canSubmit: (state) => canSubmitSpeaking(state as SpeakingModeState),
  buildSubmission: (state) =>
    buildSpeakingSubmission(state as SpeakingModeState),
  buildDraft: (state) => buildSpeakingDraft(state as SpeakingModeState),
  Hint: SpeakingHint,
  hintLabel: "Xin gợi ý cách diễn đạt",
  submittingCopy: {
    title: "Gemini đang nghe và chấm bài nói của bạn...",
    description:
      "Đang nhận diện lời nói, đánh giá phát âm và phân tích nội dung theo rubric. Quá trình mất khoảng 30–45 giây.",
  },
};
