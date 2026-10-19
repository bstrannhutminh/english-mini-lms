import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { saveDraftRequestSchema } from "@/contracts/session";
import { saveDraft } from "@/server/learning/service";

interface RouteParams {
  id: string;
}

/**
 * POST /api/v1/sessions/[id]/drafts — autosave bản nháp (optimistic version).
 * Độ dài content bị service chặn server-side (MAX_DRAFT_CHARS).
 */
export const POST = withLearner<RouteParams>(async ({ req, learner, params }) => {
  const body = await parseJson(req, saveDraftRequestSchema);

  const draft = await saveDraft(params.id, learner.id, body.content, body.version);

  return NextResponse.json(
    { success: true, draftId: draft.id, version: draft.version },
    { status: 200 }
  );
});
