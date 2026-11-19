import { NextResponse } from "next/server";
import { withLearner, parseJson, ApiRouteError } from "@/server/http";
import {
  getDueVocabularyForReview,
  getVocabularyForFlashcards,
  submitVocabularyReview,
  submitQuickFlashcardReviews,
  type QuickReviewSubmission,
} from "@/server/vocabulary/service";
import {
  submitReviewPostRequestSchema,
  type ReviewListResponse,
} from "@/contracts/vocabulary";

export const maxDuration = 60;

/**
 * GET /api/v1/vocabulary/review
 *  - ?mode=quick&limit=N&all=true → bộ thẻ flashcard (đến hạn / ôn tự do).
 *  - mặc định (&limit&extra) → từ đến hạn kèm challengePrompt (micro-challenge).
 */
export const GET = withLearner(async ({ req, learner }) => {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  // Chế độ Flashcard Quick Review
  if (mode === "quick") {
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const isFreePractice =
      searchParams.get("free") === "true" || searchParams.get("all") === "true";

    const items = await getVocabularyForFlashcards(
      learner.id,
      limit,
      isFreePractice ? "all" : "due"
    );

    const payload: ReviewListResponse = { items, count: items.length };
    return NextResponse.json(payload);
  }

  // Chế độ Micro-challenge thông thường
  const allowExtra = searchParams.get("extra") === "true";
  const limit = Math.min(10, Math.max(1, Number(searchParams.get("limit")) || 5));

  const items = await getDueVocabularyForReview(learner.id, limit, allowExtra);

  const payload: ReviewListResponse = { items, count: items.length };
  return NextResponse.json(payload);
});

/**
 * POST /api/v1/vocabulary/review
 *  - { mode: "quick", reviews[] | vocab_id+result } → batch SRS không gọi AI.
 *  - { vocab_id, scenario, user_response, modality } → micro-challenge qua Gemini.
 */
export const POST = withLearner(async ({ req, learner }) => {
  const body = await parseJson(req, submitReviewPostRequestSchema);

  // 1. mode="quick" (Flashcards SRS — không gọi AI)
  if ("mode" in body && body.mode === "quick") {
    const reviewsToProcess: QuickReviewSubmission[] = [];
    if (body.reviews && body.reviews.length > 0) {
      reviewsToProcess.push(...body.reviews);
    } else if (body.vocab_id && body.result) {
      reviewsToProcess.push({
        vocab_id: body.vocab_id,
        result: body.result,
        clientReviewId: body.clientReviewId,
      });
    } else {
      throw new ApiRouteError(
        422,
        "validation_failed",
        "Cần cung cấp vocab_id + result hoặc mảng reviews."
      );
    }

    const quickResult = await submitQuickFlashcardReviews(learner.id, reviewsToProcess);
    return NextResponse.json(quickResult, { status: 200 });
  }

  // 2. Micro-challenge truyền thống qua Gemini
  if ("scenario" in body) {
    const result = await submitVocabularyReview(
      learner.id,
      body.vocab_id,
      body.scenario,
      body.user_response,
      body.modality
    );
    return NextResponse.json(result, { status: 200 });
  }

  // Union zod luôn khớp 1 trong 2 nhánh — đến đây nghĩa là contract lệch.
  throw new ApiRouteError(422, "validation_failed", "Dữ liệu không hợp lệ.");
});
