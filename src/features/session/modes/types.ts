/**
 * Session mode plugin contract — khớp đặc tả kiến trúc §3.4
 * (docs/plan/kien-truc-tai-cau-truc-2026-10-19.md).
 *
 * Mỗi kỹ năng là một plugin; SessionShell lo mọi thứ không phụ thuộc kỹ năng.
 * `SubmissionInput`/`SubmissionResult` re-export từ `src/contracts/submission.ts`
 * (nguồn dùng chung route ⇄ client).
 */
import type { ComponentType, Dispatch, SetStateAction } from "react";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
} from "@/contracts/submission";

export type { Skill } from "@/lib/modes";
import type { Skill } from "@/lib/modes";

/**
 * Trạng thái làm bài của plugin, do `initialState` tạo và shell giữ hộ.
 * Shell chỉ truyền qua lại — plugin tự thu hẹp kiểu qua `useModeState<S>()`.
 */
export type ModeState = unknown;

/** Body của POST /api/v1/sessions/[id]/submissions (trừ parentId do shell thêm). */
export type SubmissionInput = Pick<
  CreateSubmissionRequest,
  "body" | "mediaId"
>;

/** Kết quả trả về của API submissions mà shell cần để điều hướng. */
export type SubmissionResult = CreateSubmissionResponse;

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

/** Câu hỏi nghe trắc nghiệm gửi client — đã trần đáp án/giải thích/mốc giây. */
export interface SessionListeningQuestion {
  id: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
}

/** Một câu transcript của đoạn nghe (định dạng nguồn: "start|end|text"). */
export interface SessionTranscriptSegment {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

/**
 * Payload mode Nghe từ getSessionDetails.listening.
 * Invariant: transcriptSegments chỉ có dữ liệu khi server đã ghi nhận
 * event reveal hoặc đã tồn tại submission — trước đó là mảng rỗng.
 */
export interface SessionListeningData {
  videoUrl: string | null;
  startSeconds: number;
  endSeconds: number;
  questions: SessionListeningQuestion[];
  transcriptSegments: SessionTranscriptSegment[];
  isTranscriptRevealed: boolean;
}

/** Toàn bộ dữ liệu phiên mà shell/plugin cần, lấy từ getSessionDetails. */
export interface SessionData {
  sessionId: string;
  targetMinutes: number;
  activity: SessionActivity;
  initialDraft: string;
  parentId?: string;
  parentData?: SessionParentData | null;
  /** Chỉ có khi activity là skill listening (null khi thiếu segment/câu hỏi). */
  listening?: SessionListeningData | null;
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
  /**
   * Kết quả nộp gần nhất — chỉ khác null khi plugin đặt
   * `staysAfterSubmit` (shell không chuyển trang, Panel tự render
   * màn kết quả: vd. listening = đáp án + shadowing).
   */
  submission?: SubmissionResult | null;
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
  /** Nhãn nút nộp trên thanh hành động (mặc định của shell). */
  submitLabel?: string;
  /**
   * true → shell KHÔNG chuyển sang /my-work sau khi nộp mà truyền
   * `submission` vào props Panel (listening cần ở lại để xem đáp án
   * và luyện shadowing). Mặc định/undefined = chuyển trang như cũ.
   */
  staysAfterSubmit?: boolean;
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
