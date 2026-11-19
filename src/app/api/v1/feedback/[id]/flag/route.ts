import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { flagFeedbackRequestSchema } from "@/contracts/submission";
import { flagFeedbackForReview } from "@/server/learning/feedback-review";

interface RouteParams {
  id: string;
}

/**
 * POST /api/v1/feedback/[id]/flag — "Tôi không đồng ý".
 * Đặt review_state = under_review trên feedback_versions (giữ nguyên
 * version, không sửa nội dung). Observation cụ thể được đánh dấu kèm lý do.
 * Contract: flagFeedbackRequestSchema → feedbackReviewResponseSchema.
 */
export const POST = withLearner<RouteParams>(async ({ req, learner, params }) => {
  const input = await parseJson(req, flagFeedbackRequestSchema);
  const { reviewState } = await flagFeedbackForReview(learner, params.id, input);

  return NextResponse.json({
    success: true,
    message: "Đã gắn cờ nhận xét để quản trị viên rà soát lại.",
    reviewState,
  });
});
