import { NextResponse } from "next/server";
import { withAdmin } from "@/server/http";
import { resolveFeedbackReview } from "@/server/learning/feedback-review";

interface RouteParams {
  id: string;
}

/**
 * POST /api/v1/feedback/[id]/resolve — admin đánh dấu đã rà soát xong
 * nhận xét bị gắn cờ (review_state → "active").
 * Contract: feedbackReviewResponseSchema.
 */
export const POST = withAdmin<RouteParams>(async ({ params }) => {
  const { reviewState } = await resolveFeedbackReview(params.id);

  return NextResponse.json({
    success: true,
    message: "Đã hoàn tất rà soát nhận xét.",
    reviewState,
  });
});
