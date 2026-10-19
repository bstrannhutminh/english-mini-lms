/**
 * Nhãn tiếng Việt cho trạng thái kiểm duyệt (review_state).
 * NGUỒN DUY NHẤT — mọi màn admin phải lấy nhãn ở đây, không hiển thị enum thô.
 */
import type { BadgeTone } from "@/components/ui";
import { REVIEW_STATES, type ReviewState } from "@/lib/content-constants";

export interface ReviewStateMeta {
  /** Nhãn tiếng Việt — KHÔNG kèm enum trong ngoặc. */
  label: string;
  tone: BadgeTone;
}

export const REVIEW_STATE_META: Record<ReviewState, ReviewStateMeta> = {
  draft: { label: "Nháp", tone: "neutral" },
  reviewing: { label: "Đang xét", tone: "warning" },
  approved: { label: "Đã duyệt", tone: "success" },
  rejected: { label: "Từ chối", tone: "error" },
  retired: { label: "Lưu trữ", tone: "neutral" },
};

const FALLBACK: ReviewStateMeta = { label: "Không rõ", tone: "neutral" };

export function reviewStateMeta(state: string | null | undefined): ReviewStateMeta {
  return state && state in REVIEW_STATE_META
    ? REVIEW_STATE_META[state as ReviewState]
    : FALLBACK;
}

export function reviewStateLabel(state: string | null | undefined): string {
  return reviewStateMeta(state).label;
}

/** Tùy chọn lọc/select — luôn hiển thị nhãn Việt, value giữ enum. */
export const REVIEW_STATE_OPTIONS = REVIEW_STATES.map((s) => ({
  value: s,
  label: REVIEW_STATE_META[s].label,
}));

/* ── Nhãn tiếng Việt cho select trong form sửa bài (activity-edit-form) ── */
export const DIFFICULTY_LABEL: Record<string, string> = {
  trial: "Dùng thử",
  beginner: "Cơ bản",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};
export const PURPOSE_LABEL: Record<string, string> = {
  baseline: "Đầu vào (baseline)",
  practice: "Luyện tập",
  assessment: "Đánh giá",
};
export const REVEAL_LABEL: Record<string, string> = {
  none: "Không hiện",
  after_submit: "Sau khi nộp",
  on_request: "Khi yêu cầu",
};
export const OUTPUT_LABEL: Record<string, string> = {
  text: "Văn bản",
  audio: "Ghi âm",
};
