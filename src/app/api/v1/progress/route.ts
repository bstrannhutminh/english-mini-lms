import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { getProgressSummary } from "@/server/progress/service";
import type { ProgressSummaryContract } from "@/contracts/progress";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/progress — exemplar wiring of the shared http helpers:
 * withLearner derives learner_id from the session; errors map through
 * mapServiceError (503 on missing env/DB, 500 otherwise).
 * The ProgressSummaryContract annotation locks the wire shape at compile time.
 */
export const GET = withLearner(async ({ learner }) => {
  const summary: ProgressSummaryContract = await getProgressSummary(learner.id);
  return NextResponse.json(summary);
});
