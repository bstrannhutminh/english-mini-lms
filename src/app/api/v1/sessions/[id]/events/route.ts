import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { createSessionEventRequestSchema } from "@/contracts/session";
import { recordSessionEvent } from "@/server/learning/service";

interface RouteParams {
  id: string;
}

/**
 * POST /api/v1/sessions/[id]/events — ghi session_events.
 * hint/reveal là nguồn duy nhất suy ra submissions.assisted phía server.
 */
export const POST = withLearner<RouteParams>(async ({ req, learner, params }) => {
  const body = await parseJson(req, createSessionEventRequestSchema);

  const event = await recordSessionEvent(
    params.id,
    learner.id,
    body.kind,
    body.payload
  );

  return NextResponse.json({ success: true, eventId: event.id }, { status: 201 });
});
