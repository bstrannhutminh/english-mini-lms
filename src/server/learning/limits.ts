/**
 * Server-side enforcement limits for the learning domain.
 * The zod contracts (src/contracts) already cap the submission body at
 * 20.000 chars — these constants mirror that rule INSIDE the services so
 * limits hold even when a caller bypasses the route layer (server
 * components, future jobs), per the project rule "text ≤ 20.000 ký tự,
 * audio ≤ 5 phút".
 */
import { GEMINI_TIMEOUT_MS } from "@/server/providers/gemini/client";

/** submissions.body / structured JSON bodies — same cap as the contract. */
export const MAX_SUBMISSION_BODY_CHARS = 20_000;

/** drafts.content autosave payload. */
export const MAX_DRAFT_CHARS = 20_000;

/** Audio recordings (speaking submissions, shadowing attempts): 5 phút. */
export const MAX_AUDIO_DURATION_SECONDS = 300;

/** Số lần chấm tối đa cho một bài nộp (lần đầu + chấm lại). */
export const MAX_ASSESSMENT_ATTEMPTS = 3;

/**
 * Sweeper threshold: một assessment kẹt ở queued/processing lâu hơn
 * 2× timeout Gemini được xem là chết (route đã bị Vercel kill) → chuyển
 * failed khi được quan sát (status read / retry).
 */
export const STUCK_ASSESSMENT_MS = 2 * GEMINI_TIMEOUT_MS;
