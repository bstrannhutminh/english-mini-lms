/**
 * Kiểu dùng chung cho features/my-work — khớp dữ liệu
 * getSubmissionWithFeedback() (server) đổ xuống page.tsx.
 * Shape feedback theo contract src/contracts/submission.ts (snake_case
 * ở observation/next_action/retry_prompt — Gemini & DB lưu vậy).
 */
import type {
  FeedbackObservation,
  PracticeScore,
  PronunciationResult,
} from "@/contracts/submission";

export type { FeedbackObservation };

/** Feedback như page truyền xuống — WritingFeedback + metadata version. */
export interface MyWorkFeedback {
  id?: string;
  reviewState?: string | null;
  observations: FeedbackObservation[];
  strengths: string[];
  next_action: string;
  limitations: string;
  scores: PracticeScore[];
  pronunciation?: PronunciationResult | null;
}

/** Bài nộp (của getSubmissionWithFeedback — có signed audioUrl tạm). */
export interface SubmissionDetail {
  id: string;
  sessionId: string;
  revision: number;
  modality?: "text" | "audio";
  body: string | null;
  assisted: boolean;
  submittedAt: string | Date;
  audioUrl?: string | null;
  confirmedTranscript?: string | null;
}

export interface ActivityMeta {
  id: string;
  slot: string | null;
  title: string;
  mode: string;
  promptText: string | null;
}

export interface AssessmentInfo {
  id: string;
  status: string;
  resultRef: string | null;
}

export interface ParentRevision {
  submission: Pick<
    SubmissionDetail,
    "id" | "revision" | "body" | "assisted" | "submittedAt" | "audioUrl"
  >;
  feedback: MyWorkFeedback | null;
}
