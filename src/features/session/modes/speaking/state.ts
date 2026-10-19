/**
 * Trạng thái + logic thuần của mode Nói.
 * Tách riêng khỏi Panel để test hermetic (không import React/DOM).
 *
 * Invariant: có audio thật → submission PHẢI kèm mediaId; nộp chỉ văn bản
 * (khi micro không khả dụng) → chỉ gửi body, server ghi
 * pronunciation = not_assessable. Client không bao giờ gửi `assisted`.
 */
import type { SessionData, SubmissionInput, SubmitCheck } from "../types";

/** Vòng đời upload file ghi âm lên POST /api/v1/media → mediaId. */
export type MediaUploadStatus = "idle" | "uploading" | "ready" | "error";

export interface SpeakingModeState {
  /** Ghi chú/bản thảo của người học — đồng thời là đường nộp text-only. */
  notes: string;
  /** media_id sau khi upload thành công; null khi chưa/không có audio. */
  mediaId: string | null;
  mediaStatus: MediaUploadStatus;
  /** Thông báo lỗi upload tiếng Việt (có đường thử lại trong panel). */
  mediaError: string | null;
  /** Độ dài bản ghi (giây) để hiển thị. */
  durationSeconds: number;
  /** Panel đồng bộ từ useRecorder — chặn nộp giữa chừng khi đang thu. */
  isRecording: boolean;
  /** Mở rộng khung đối chiếu Bản trước (luồng revision). */
  showParentRef: boolean;
}

export function initialSpeakingState(data: SessionData): SpeakingModeState {
  return {
    // Ưu tiên nháp; khi sửa lại → nạp sẵn ghi chú (body) của bản cha
    notes: data.initialDraft || data.parentData?.submission.body || "",
    mediaId: null,
    mediaStatus: "idle",
    mediaError: null,
    durationSeconds: 0,
    isRecording: false,
    showParentRef: Boolean(data.parentData),
  };
}

/**
 * Đủ điều kiện nộp khi: audio đã upload xong (mediaId) HOẶC có nội dung
 * văn bản (đường text-only). Đang upload / upload lỗi → chặn nộp để không
 * mất audio (người học thử lại hoặc xoá ghi âm rồi nộp text).
 */
export function canSubmitSpeaking(state: SpeakingModeState): SubmitCheck {
  if (state.isRecording) {
    return {
      ok: false,
      reason: "Đang ghi âm — nhấn Dừng ghi âm trước khi nộp bài.",
    };
  }
  if (state.mediaStatus === "uploading") {
    return {
      ok: false,
      reason: "Đang tải file ghi âm lên máy chủ, vui lòng chờ giây lát.",
    };
  }
  if (state.mediaStatus === "error") {
    return {
      ok: false,
      reason:
        state.mediaError ||
        "File ghi âm chưa tải lên được — bấm “Thử lại” trong khung ghi âm hoặc xoá ghi âm để nộp dạng văn bản.",
    };
  }
  if (state.mediaStatus === "ready" && state.mediaId) {
    return { ok: true };
  }
  if (state.notes.trim()) {
    return { ok: true };
  }
  return {
    ok: false,
    reason:
      "Vui lòng ghi âm bài nói trước khi nộp (hoặc nhập nội dung ở ô ghi chú để nộp dạng văn bản).",
  };
}

/**
 * mediaId chỉ đi kèm khi audio đã sẵn sàng; text-only → chỉ body
 * → server đánh dấu pronunciation not_assessable (invariant).
 */
export function buildSpeakingSubmission(state: SpeakingModeState): SubmissionInput {
  const input: SubmissionInput = {};
  if (state.mediaStatus === "ready" && state.mediaId) {
    input.mediaId = state.mediaId;
  }
  if (state.notes.trim()) {
    input.body = state.notes.trim();
  }
  return input;
}

/** Draft = ghi chú (audio không lưu nháp được); rỗng → autosave bỏ qua. */
export function buildSpeakingDraft(state: SpeakingModeState): string {
  return state.notes;
}
