/**
 * Gemini call policy — the single place that decides:
 *  1. TIMEOUT: every generateContent call carries
 *     `abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS)` (see geminiCallConfig).
 *  2. RETRY: a call is retried exactly ONCE and only when the HTTP call
 *     succeeded but the payload was unparseable / failed schema validation
 *     (GeminiResponseError). Network errors, HTTP 4xx/5xx (ApiError) and
 *     abort/timeout NEVER retry — they fail fast so the assessment can be
 *     marked `failed` instead of burning the 60s route budget.
 *  3. ERROR TEXT: every failure is normalized to a Vietnamese message via
 *     toVietnameseGeminiError() — stored in assessments.result_ref and shown
 *     to the learner next to the "Chấm lại" button.
 *
 * This module is intentionally free of @google/genai imports so unit tests
 * can exercise the policy with fake providers (no real API calls).
 */
import { GEMINI_TIMEOUT_MS } from "./client";
import { EnvError } from "@/lib/env";

/**
 * Thrown when Gemini responded but the body is not valid JSON or does not
 * satisfy the expected zod schema — the ONLY retryable failure class.
 */
export class GeminiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiResponseError";
  }
}

/** Abort signal applied to every generateContent config. */
export function geminiAbortSignal(): AbortSignal {
  return AbortSignal.timeout(GEMINI_TIMEOUT_MS);
}

/**
 * True only for errors that may produce a different result on an immediate
 * retry — i.e. malformed JSON / schema mismatch (GeminiResponseError).
 * ApiError (429/5xx), TimeoutError/AbortError and TypeError (network) are
 * deliberately NOT retryable.
 */
export function isRetryableGeminiError(error: unknown): boolean {
  return error instanceof GeminiResponseError;
}

/** Detect abort/timeout raised by AbortSignal.timeout inside the SDK/fetch. */
function isAbortOrTimeoutError(error: unknown): boolean {
  const name = (error as { name?: string } | null)?.name;
  return name === "TimeoutError" || name === "AbortError";
}

/** HTTP status carried by @google/genai ApiError (e.g. 429, 500, 503). */
function httpStatusOf(error: unknown): number | null {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" && status >= 100 && status < 600
    ? status
    : null;
}

/**
 * Convert any failure into a Vietnamese, learner-visible Error.
 * GeminiResponseError already carries Vietnamese text → returned as-is.
 */
export function toVietnameseGeminiError(error: unknown): Error {
  if (error instanceof GeminiResponseError) {
    return error;
  }

  if (isAbortOrTimeoutError(error)) {
    return new Error(
      `Gemini không phản hồi trong ${Math.round(
        GEMINI_TIMEOUT_MS / 1000
      )} giây. Bài nộp đã được lưu — bạn có thể bấm "Chấm lại" sau ít phút.`
    );
  }

  // EnvError nói thẳng tên biến môi trường — chi tiết đó dành cho log/admin,
  // người học chỉ cần biết hệ thống chấm tạm nghỉ.
  if (
    error instanceof EnvError ||
    (error as { name?: string } | null)?.name === "EnvError"
  ) {
    return new Error(
      "Hệ thống chấm bài tạm thời chưa sẵn sàng. Bài nộp đã được lưu — bạn có thể bấm \"Chấm lại\" sau ít phút."
    );
  }

  const status = httpStatusOf(error);
  if (status !== null) {
    const detail =
      status === 429
        ? "hệ thống chấm đang quá tải"
        : status >= 500
          ? "máy chủ Gemini đang gặp sự cố"
          : "yêu cầu bị từ chối";
    return new Error(
      `Gemini trả về lỗi HTTP ${status} (${detail}). Bài nộp đã được lưu — bạn có thể bấm "Chấm lại" sau ít phút.`
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  return new Error(
    `Không gọi được Gemini (${message}). Bài nộp đã được lưu — bạn có thể bấm "Chấm lại" sau ít phút.`
  );
}

/**
 * Execute one Gemini evaluation call with the project retry policy:
 *   - attempt 1 fails with GeminiResponseError → warn + attempt 2
 *   - attempt 1 fails with anything else → fail fast (normalized message)
 *   - attempt 2 fails (any reason) → fail fast (normalized message)
 */
export async function callGeminiWithRetry<T>(
  call: () => Promise<T>,
  label: string
): Promise<T> {
  try {
    return await call();
  } catch (firstError) {
    if (!isRetryableGeminiError(firstError)) {
      throw toVietnameseGeminiError(firstError);
    }
    console.warn(
      `⚠️ ${label}: phản hồi không đúng định dạng, thử lại 1 lần cuối...`,
      firstError
    );
    try {
      return await call();
    } catch (secondError) {
      throw toVietnameseGeminiError(secondError);
    }
  }
}
