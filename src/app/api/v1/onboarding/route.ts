import { NextResponse } from "next/server";
import { parseJson, withLearner } from "@/server/http";
import { onboardingPayloadSchema } from "@/contracts/onboarding";
import {
  getLearnerOnboardingProfile,
  saveLearnerOnboardingProfile,
} from "@/server/onboarding/service";

export const dynamic = "force-dynamic";

/** GET /api/v1/onboarding — hồ sơ onboarding hiện tại (null nếu chưa có). */
export const GET = withLearner(async ({ learner }) => {
  const profile = await getLearnerOnboardingProfile(learner.id);
  return NextResponse.json({ profile });
});

/**
 * POST /api/v1/onboarding — lưu hồ sơ. Body parse qua contract
 * (422 + fields khi sai); learner_id từ session, không nhận từ body.
 */
export const POST = withLearner(async ({ req, learner }) => {
  const body = await parseJson(req, onboardingPayloadSchema);
  const updated = await saveLearnerOnboardingProfile(learner.id, body);
  return NextResponse.json({ success: true, learner: updated });
});
