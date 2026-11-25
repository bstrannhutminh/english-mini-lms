import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { getAssessmentStatusForLearner } from "@/server/learning/service";

interface RouteParams {
  id: string;
}

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/assessments/[id]/status — poll nhẹ khi assessment còn
 * queued/processing: trả đúng `{ status }` (1 truy vấn indexed, có chạy
 * sweeper) thay vì bắt client router.refresh() full trang mỗi 6 giây.
 * learner_id từ session; không phải chủ bài (và không phải admin) → 403.
 */
export const GET = withLearner<RouteParams>(async ({ learner, params }) => {
  const result = await getAssessmentStatusForLearner(
    params.id,
    learner.id,
    learner.role === "admin"
  );

  return NextResponse.json(result, { status: 200 });
});
