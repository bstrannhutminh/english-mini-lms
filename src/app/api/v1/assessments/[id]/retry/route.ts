import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { retryAssessment } from "@/server/learning/service";

interface RouteParams {
  id: string;
}

export const maxDuration = 60;

/**
 * POST /api/v1/assessments/[id]/retry — chấm lại bài failed/kẹt.
 * Guard trạng thái + giới hạn lần thử nằm trong service; learner không phải
 * admin chỉ chấm lại được bài của chính mình.
 */
export const POST = withLearner<RouteParams>(async ({ learner, params }) => {
  const result = await retryAssessment(
    params.id,
    learner.id,
    learner.role === "admin"
  );

  return NextResponse.json(result, { status: 200 });
});
