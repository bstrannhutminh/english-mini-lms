/**
 * Plugin mode Nghe (Listening + Shadowing là chế độ con, đặc tả §3.4).
 * Port từ listening-session-view.tsx + components/listening-*.tsx:
 * - YouTube player đoạn start/end (shared/youtube-player, tốc độ 0.75x,
 *   fallback link khi video chặn nhúng), phím tắt Space/←/→.
 * - Trả lời trắc nghiệm → nộp { answers } (append-only, parentId do shell thêm).
 * - `staysAfterSubmit`: ở lại trang sau nộp để xem đáp án + luyện Shadowing
 *   (ghi âm từng câu → media_id → POST /shadowing, giống speaking).
 * - Transcript chỉ hiện khi server trả segments (đã reveal hoặc đã nộp);
 *   reveal POST fail → lỗi tiếng Việt + retry, không mở.
 */
import type { ModePlugin } from "../types";
import { ListeningPanel } from "./listening-panel";
import {
  buildDraft,
  buildSubmission,
  canSubmit,
  initialState,
} from "./state";

export const listeningPlugin: ModePlugin = {
  skill: "listening",
  Panel: ListeningPanel,
  initialState,
  canSubmit,
  buildSubmission,
  buildDraft,
  staysAfterSubmit: true,
  submitLabel: "📤 Nộp bài & Xem đáp án chi tiết",
  submittingCopy: {
    title: "Hệ thống đang chấm các câu trả lời của bạn...",
    description:
      "Đang đối chiếu từng đáp án với nội dung đoạn nghe để gợi ý đoạn cần nghe lại. Chỉ mất vài giây.",
  },
};
