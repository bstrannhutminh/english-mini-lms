import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { createSessionRequestSchema } from "@/contracts/session";
import { createSession } from "@/server/learning/service";

/**
 * POST /api/v1/sessions — tạo phiên học mới.
 * learner_id luôn lấy từ session Supabase (withLearner), 409 trả kèm
 * sessionId của phiên đang mở qua ConflictError → mapServiceError.
 */
export const POST = withLearner(async ({ req, learner }) => {
  const body = await parseJson(req, createSessionRequestSchema);

  const session = await createSession(
    learner.id,
    body.activityId,
    body.targetMinutes,
    { checkConflict: true }
  );

  return NextResponse.json({ sessionId: session.id }, { status: 201 });
});
