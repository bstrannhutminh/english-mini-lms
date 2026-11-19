/**
 * Client fetch layer cho /api/v1/vocabulary* — mọi call đi qua apiFetch +
 * contract zod (rule §4.1: cấm tự viết fetch với field name tay).
 */
"use client";

import { apiFetch } from "@/lib/api-client";
import {
  createVocabularyRequestSchema,
  createVocabularyResponseSchema,
  quickCaptureRequestSchema,
  quickCaptureResponseSchema,
  reviewListResponseSchema,
  submitQuickReviewResponseSchema,
  submitReviewRequestSchema,
  submitReviewResponseSchema,
  updateVocabularyResponseSchema,
  vocabularyListResponseSchema,
  type CreateVocabularyRequest,
  type QuickCaptureRequest,
  type QuickCaptureResponse,
  type QuickReviewItem,
  type ReviewListResponse,
  type SubmitQuickReviewResponse,
  type SubmitReviewRequest,
  type SubmitReviewResponse,
  type UpdateVocabularyRequest,
  type VocabularyItem,
  type VocabularyListResponse,
} from "@/contracts/vocabulary";
import type { z } from "zod";

export type CreateVocabularyResponse = z.infer<typeof createVocabularyResponseSchema>;
export type VocabFilter = "all" | "due" | "mastered";
export type FlashcardDeckItem = ReviewListResponse["items"][number];

const JSON_HEADERS = { "Content-Type": "application/json" };

/** GET /api/v1/vocabulary?filter=… */
export function fetchVocabularyList(
  filter: VocabFilter = "all"
): Promise<VocabularyListResponse> {
  return apiFetch(
    `/api/v1/vocabulary?filter=${filter}`,
    undefined,
    vocabularyListResponseSchema
  );
}

/** POST /api/v1/vocabulary — lưu từ vào sổ (body snake_case theo contract). */
export function createVocabularyEntry(
  body: CreateVocabularyRequest
): Promise<CreateVocabularyResponse> {
  // Validate phía client trước khi bắn — lỗi rõ ngay, khỏi vòng server.
  const parsed = createVocabularyRequestSchema.parse(body);
  return apiFetch(
    "/api/v1/vocabulary",
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(parsed) },
    createVocabularyResponseSchema
  );
}

/** PATCH /api/v1/vocabulary/[id] — sửa my_attempt / mastery_level / context_meaning. */
export function patchVocabulary(
  id: string,
  body: UpdateVocabularyRequest
): Promise<{ vocabulary: VocabularyItem }> {
  return apiFetch(
    `/api/v1/vocabulary/${id}`,
    { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(body) },
    updateVocabularyResponseSchema
  );
}

/** POST /api/v1/vocabulary/quick-capture — tra cứu chuyên ngành qua Gemini. */
export function quickCaptureLookup(
  body: QuickCaptureRequest
): Promise<QuickCaptureResponse> {
  const parsed = quickCaptureRequestSchema.parse(body);
  return apiFetch(
    "/api/v1/vocabulary/quick-capture",
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(parsed) },
    quickCaptureResponseSchema
  );
}

/** GET /api/v1/vocabulary/review?mode=quick… — bộ thẻ flashcard. */
export function fetchFlashcardDeck(options: {
  freePractice?: boolean;
  limit?: number;
} = {}): Promise<ReviewListResponse> {
  const limit = options.limit ?? (options.freePractice ? 30 : 20);
  const all = options.freePractice ? "&all=true" : "";
  return apiFetch(
    `/api/v1/vocabulary/review?mode=quick${all}&limit=${limit}`,
    undefined,
    reviewListResponseSchema
  );
}

/** POST /api/v1/vocabulary/review {mode:"quick",reviews[]} — batch SRS quẹt thẻ. */
export function submitQuickReviews(
  reviews: QuickReviewItem[]
): Promise<SubmitQuickReviewResponse> {
  return apiFetch(
    "/api/v1/vocabulary/review",
    {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ mode: "quick", reviews }),
    },
    submitQuickReviewResponseSchema
  );
}

/** GET /api/v1/vocabulary/review?limit=N — từ đến hạn kèm challengePrompt. */
export function fetchReviewItems(
  limit = 5,
  extra = false
): Promise<ReviewListResponse> {
  return apiFetch(
    `/api/v1/vocabulary/review?limit=${limit}${extra ? "&extra=true" : ""}`,
    undefined,
    reviewListResponseSchema
  );
}

/** POST /api/v1/vocabulary/review — nộp câu micro-challenge (Gemini chấm). */
export function submitWrittenReview(
  body: SubmitReviewRequest
): Promise<SubmitReviewResponse> {
  const parsed = submitReviewRequestSchema.parse(body);
  return apiFetch(
    "/api/v1/vocabulary/review",
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(parsed) },
    submitReviewResponseSchema
  );
}
