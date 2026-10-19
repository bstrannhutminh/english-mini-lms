import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { shadowingRequestSchema } from "@/contracts/session";
import { evaluateShadowingAttempt } from "@/server/learning/service";

interface RouteParams {
  id: string;
}

export const maxDuration = 60;

/**
 * POST /api/v1/sessions/[id]/shadowing — chấm một câu nhại giọng.
 * Logic nằm trong service (session→media→Gemini→usage_events); route mỏng.
 */
export const POST = withLearner<RouteParams>(async ({ req, learner, params }) => {
  const body = await parseJson(req, shadowingRequestSchema);

  const feedback = await evaluateShadowingAttempt(params.id, learner.id, {
    mediaId: body.media_id,
    sentence: body.sentence,
    startSeconds: body.startSeconds,
    endSeconds: body.endSeconds,
  });

  return NextResponse.json({ success: true, feedback });
});
