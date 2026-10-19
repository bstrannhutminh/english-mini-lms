import { NextResponse } from "next/server";
import { parseJson, withLearner } from "@/server/http";
import { preferencesPatchSchema } from "@/contracts/settings";
import { updateLearnerPreferences } from "@/server/settings/preferences";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/v1/settings/preferences — merge khoá được gửi vào learners.preferences.
 * Body parse qua contract (422 + fields khi sai); learner_id từ session.
 */
export const PATCH = withLearner(async ({ req, learner }) => {
  const patch = await parseJson(req, preferencesPatchSchema);
  const updated = await updateLearnerPreferences(learner.id, patch);
  return NextResponse.json({ success: true, preferences: updated });
});
