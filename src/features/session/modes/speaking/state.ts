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

export interface SpeakingDraftPayload {
  notes: string;
  mediaId: string | null;
  durationSeconds: number;
}

const SPEAKING_DRAFT_KIND = "speaking-draft-v1";

/** Parse draft backward-compatible: bản cũ là plain text notes, bản mới là JSON có marker. */
export function parseSpeakingDraft(raw: string | null | undefined): SpeakingDraftPayload {
  const empty: SpeakingDraftPayload = { notes: "", mediaId: null, durationSeconds: 0 };
  if (!raw) return empty;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const p = parsed as Record<string, unknown>;
      if (p.kind === SPEAKING_DRAFT_KIND) {
        return {
          notes: typeof p.notes === "string" ? p.notes : "",
          mediaId: typeof p.mediaId === "string" ? p.mediaId : null,
          durationSeconds:
            typeof p.durationSeconds === "number" && Number.isFinite(p.durationSeconds)
              ? Math.max(0, Math.round(p.durationSeconds))
              : 0,
        };
      }
    }
  } catch {
    // Plain text draft cũ — rơi xuống nhánh backward-compatible bên dưới.
  }
  return { ...empty, notes: raw };
}

/** JSON-in-string vì drafts.content là text column (giống pattern reading mode). */
export function serializeSpeakingDraft(payload: SpeakingDraftPayload): string {
  return JSON.stringify({
    kind: SPEAKING_DRAFT_KIND,
    notes: payload.notes,
    mediaId: payload.mediaId,
    durationSeconds: Math.max(0, Math.round(payload.durationSeconds)),
  });
}

export function initialSpeakingState(data: SessionData): SpeakingModeState {
  const draft = data.initialDraft ? parseSpeakingDraft(data.initialDraft) : null;
  const mediaId = draft?.mediaId ?? null;
  return {
    // Ưu tiên nháp; khi sửa lại và chưa có nháp → nạp sẵn ghi chú của bản cha.
    notes: draft?.notes ?? data.parentData?.submission.body ?? "",
    mediaId,
    mediaStatus: mediaId ? "ready" : "idle",
    mediaError: null,
    durationSeconds: draft?.durationSeconds ?? 0,
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

/**
 * Draft gồm cả mediaId của audio đã upload. Blob thật không thể tái tạo sau
 * reload, nhưng media trên server là nguồn bền; panel sẽ xin signed-url để
 * nghe lại/xoá/ghi đè. Hoàn toàn rỗng → trả "" để autosave bỏ qua.
 */
export function buildSpeakingDraft(state: SpeakingModeState): string {
  if (!state.notes.trim() && !state.mediaId) return "";
  return serializeSpeakingDraft({
    notes: state.notes,
    mediaId: state.mediaStatus === "ready" ? state.mediaId : null,
    durationSeconds: state.durationSeconds,
  });
}
