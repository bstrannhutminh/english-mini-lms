import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { createSubmissionRequestSchema } from "@/contracts/submission";
import { createSubmissionAndAssess } from "@/server/learning/service";

interface RouteParams {
  id: string;
}

export const maxDuration = 60;

/**
 * POST /api/v1/sessions/[id]/submissions — nộp bài + kích hoạt chấm AI.
 * Contract chấp nhận cả `mediaId` và `media_id` (legacy); trường `assisted`
 * nếu client cố gửi sẽ bị zod strip — server tự tính từ session_events.
 */
export const POST = withLearner<RouteParams>(async ({ req, learner, params }) => {
  const body = await parseJson(req, createSubmissionRequestSchema);

  const effectiveMediaId = body.mediaId ?? body.media_id;

  const result = await createSubmissionAndAssess(
    params.id,
    learner.id,
    body.body || "",
    body.parentId,
    effectiveMediaId
  );

  return NextResponse.json(
    {
      submissionId: result.submission.id,
      assessmentId: result.assessment.id,
      status: result.assessment.status,
      revision: result.submission.revision,
      assisted: result.submission.assisted,
      feedback: result.feedback,
    },
    { status: 201 }
  );
});
