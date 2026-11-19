import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { getTodayRecommendation } from "@/server/today/service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/today?target_minutes=30|45 — recommendation + daily plan.
 * Wire shape: contracts/today.ts (todayRecommendationSchema). learner_id
 * comes from the session via withLearner; errors map via mapServiceError.
 */
export const GET = withLearner(async ({ req, learner }) => {
  const { searchParams } = new URL(req.url);
  const targetMinParam = searchParams.get("target_minutes");
  const targetMinutes = targetMinParam === "45" ? 45 : 30;

  const recommendation = await getTodayRecommendation(learner.id, targetMinutes);
  return NextResponse.json(recommendation);
});
