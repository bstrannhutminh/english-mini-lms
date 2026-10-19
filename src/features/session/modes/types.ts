/**
 * Session mode plugin contract — khớp đặc tả kiến trúc §3.4
 * (docs/plan/kien-truc-tai-cau-truc-2026-10-19.md).
 *
 * Mỗi kỹ năng là một plugin; SessionShell lo mọi thứ không phụ thuộc kỹ năng.
 * `SubmissionInput` ở đây là định nghĩa tạm — sẽ được thay bằng
 * `src/contracts/submission.ts` khi contracts chính thức land.
 */
import type { ComponentType, Dispatch, SetStateAction } from "react";

export type Skill = "writing" | "reading" | "speaking" | "listening";

/**
 * Trạng thái làm bài của plugin, do `initialState` tạo và shell giữ hộ.
 * Shell chỉ truyền qua lại — plugin tự thu hẹp kiểu qua `useModeState<S>()`.
 */
export type ModeState = unknown;

/** Body của POST /api/v1/sessions/[id]/submissions (trừ parentId do shell thêm). */
export interface SubmissionInput {
  body?: string;
  mediaId?: string;
}

/** Kết quả trả về của API submissions mà shell cần để điều hướng. */
export interface SubmissionResult {
  submissionId: string;
  assessmentId?: string;
  status?: string;
  revision?: number;
  assisted?: boolean;
  feedback?: unknown;
}

/** Thông tin bài học (activities) mà page.tsx truyền xuống. */
export interface SessionActivity {
  id: string;
  slot: string | null;
  title: string;
  mode: string;
  objective: string | null;
  promptText: string | null;
  feedbackGuide: string | null;
  durationMinutes?: number | null;
}

/** Bài nộp bản trước (cho luồng "Sửa lại" qua ?parentId=). */
export interface SessionParentData {
  submission: {
    id: string;
    revision: number;
    body: string | null;
    assisted: boolean;
    submittedAt: Date;
    audioUrl?: string | null;
  };
  /** WritingFeedback | SpeakingFeedback tuỳ mode — plugin tự thu hẹp kiểu. */
  feedback: unknown | null;
}

/** Toàn bộ dữ liệu phiên mà shell/plugin cần, lấy từ getSessionDetails. */
export interface SessionData {
  sessionId: string;
  targetMinutes: number;
  activity: SessionActivity;
  initialDraft: string;
  parentId?: string;
  parentData?: SessionParentData | null;
}

/** Kết quả kiểm tra "đủ điều kiện nộp chưa" — reason là thông báo tiếng Việt. */
export interface SubmitCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Handlers rải lên vùng văn bản cho phép bôi đen → Smart Capture.
 * Panel gọi `capture.selectHandlers(fullText, sourceRef)` rồi spread
 * vào div chứa đoạn văn gốc (không phải textarea).
 */
export interface CaptureHelpers {
  selectHandlers: (
    fullText: string,
    sourceRef: string,
  ) => {
    onMouseUp: () => void;
    onTouchEnd: () => void;
  };
}

/** Props shell truyền cho Panel của plugin. */
export interface ModePanelProps {
  data: SessionData;
  state: ModeState;
  setState: Dispatch<SetStateAction<ModeState>>;
  /** Đang nộp bài — panel nên khoá input. */
  busy: boolean;
  /** Ghi session_events (hint/reveal/…). assisted do server tính. */
  postEvent: (
    kind: "hint" | "reveal" | "pause" | "resume" | "finish",
    payload?: Record<string, unknown>,
  ) => Promise<boolean>;
  capture: CaptureHelpers;
}

export interface ModePlugin {
  skill: Skill;
  /** Phần làm bài, không có chrome (header/timer/thanh nút là của shell). */
  Panel: ComponentType<ModePanelProps>;
  initialState: (data: SessionData) => ModeState;
  canSubmit: (state: ModeState) => SubmitCheck;
  buildSubmission: (state: ModeState) => SubmissionInput;
  /** Nội dung lưu nháp định kỳ; trả "" khi chưa có gì để lưu. */
  buildDraft: (state: ModeState) => string;
  /** Nội dung hiển thị sau khi bấm "Xin gợi ý" (đã ghi event hint). */
  Hint?: ComponentType<{ data: SessionData }>;
  /** Nhãn nút gợi ý, ví dụ "Xin gợi ý dàn bài". */
  hintLabel?: string;
  /** Text overlay trong lúc đợi chấm bài. */
  submittingCopy?: { title: string; description: string };
}

/** Thu hẹp state opaque của shell về kiểu riêng của plugin. */
export function usePluginState<S>(props: ModePanelProps): {
  state: S;
  setState: (updater: (prev: S) => S) => void;
} {
  return {
    state: props.state as S,
    setState: (updater) =>
      props.setState((prev: ModeState) => updater(prev as S) as ModeState),
  };
}
