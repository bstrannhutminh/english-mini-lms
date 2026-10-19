import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { listLearnerSubmissions } from "@/server/learning/submission-list";

/**
 * GET /api/v1/submissions?mode=<mode> — danh sách bài nộp của learner
 * (kèm trạng thái assessment mới nhất + parentId cho chuỗi bản sửa).
 * Contract: submissionListResponseSchema.
 */
export const GET = withLearner(async ({ req, learner }) => {
  const { searchParams } = new URL(req.url);
  const modeFilter = searchParams.get("mode");

  const items = await listLearnerSubmissions(learner.id, modeFilter);
  return NextResponse.json({ submissions: items });
});
