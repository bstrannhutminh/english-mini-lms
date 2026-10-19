/**
 * Trạng thái làm bài của mode Nghe — shell giữ opaque, plugin thu hẹp ở đây.
 * Transcript KHÔNG bao giờ nằm trong state: chỉ đọc từ data.listening
 * (server gate) — state chỉ ghi "đã bấm reveal" + lỗi.
 */
import type { SpeakingFeedback } from "@/contracts/submission";
import type { SessionData, SubmitCheck } from "../types";
import { parseListeningAnswersBody } from "@/lib/listening-answer-checking";

export type ShadowingTab = "review" | "shadowing";

export interface ListeningModeState {
  /** Id các câu hỏi của bài (chốt từ data.listening lúc khởi tạo). */
  questionIds: string[];
  /** Đáp án đã chọn: { questionId: optionId }. */
  answers: Record<string, string>;
  /** Đã bấm "Mở transcript" và ghi event reveal thành công. */
  revealed: boolean;
  /** Đang chờ POST event reveal. */
  isRevealing: boolean;
  /** Lỗi ghi event reveal — transcript KHÔNG được mở khi có lỗi. */
  revealError: string | null;
  /** Id submission vừa nộp — khoá nộp lại + bật màn kết quả. */
  submittedId: string | null;
  /** Tab sau nộp: xem đáp án hay luyện shadowing từng câu. */
  activeTab: ShadowingTab;
  /** Kết quả chấm phát âm shadowing theo index câu transcript. */
  shadowingResults: Record<number, SpeakingFeedback>;
}

export function initialState(data: SessionData): ListeningModeState {
  return {
    questionIds: (data.listening?.questions ?? []).map((q) => q.id),
    // Nháp bài nghe lưu cùng format body nộp: { answers: { q1: "B" } }
    answers: parseListeningAnswersBody(data.initialDraft),
    revealed: false,
    isRevealing: false,
    revealError: null,
    submittedId: null,
    activeTab: "review",
    shadowingResults: {},
  };
}

export function canSubmit(state: unknown): SubmitCheck {
  const s = state as ListeningModeState;
  if (s.submittedId) {
    return {
      ok: false,
      reason: "Bài đã được nộp — xem đáp án và luyện Shadowing bên dưới.",
    };
  }
  if (s.questionIds.length === 0) {
    return {
      ok: false,
      reason: "Bài nghe này chưa có câu hỏi — không thể nộp.",
    };
  }
  const answered = s.questionIds.filter((id) => s.answers[id]).length;
  return answered >= s.questionIds.length
    ? { ok: true }
    : {
        ok: false,
        reason: `Vui lòng trả lời đủ ${s.questionIds.length} câu hỏi (đã chọn ${answered}/${s.questionIds.length}).`,
      };
}

export function buildSubmission(state: unknown): { body: string } {
  const s = state as ListeningModeState;
  return { body: JSON.stringify({ answers: s.answers }) };
}

/** Nháp = đáp án đã chọn (JSON, đọc lại bằng parseListeningAnswersBody). */
export function buildDraft(state: unknown): string {
  const s = state as ListeningModeState;
  return Object.keys(s.answers).length > 0
    ? JSON.stringify({ answers: s.answers })
    : "";
}
