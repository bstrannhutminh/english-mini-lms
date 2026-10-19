import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { getSettingsOverview } from "@/server/settings/service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/settings — hồ sơ learner + bài nộp gần đây cho trang Cài đặt.
 * learner_id từ session (withLearner); lỗi map qua mapServiceError.
 */
export const GET = withLearner(async ({ learner }) => {
  const data = await getSettingsOverview(learner.id);
  return NextResponse.json(data);
});
