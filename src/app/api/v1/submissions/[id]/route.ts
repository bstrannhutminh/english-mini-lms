import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { updateSubmissionRequestSchema } from "@/contracts/submission";
import {
  confirmSubmissionTranscript,
  softDeleteSubmission,
} from "@/server/learning/submission-mutations";

interface RouteParams {
  id: string;
}

/**
 * PATCH /api/v1/submissions/[id] — APPEND-ONLY invariant:
 * chỉ `confirmed_transcript` được sửa (và chỉ trên bài audio).
 * `body` của bài đã nộp tuyệt đối không UPDATE — bản sửa là submission mới.
 * Contract: updateSubmissionRequestSchema → updateSubmissionResponseSchema.
 */
export const PATCH = withLearner<RouteParams>(async ({ req, learner, params }) => {
  const { confirmed_transcript } = await parseJson(
    req,
    updateSubmissionRequestSchema
  );
  const updated = await confirmSubmissionTranscript(
    learner.id,
    params.id,
    confirmed_transcript
  );
  return NextResponse.json({ success: true, submission: updated });
});

/**
 * DELETE /api/v1/submissions/[id] — soft-delete + dọn file audio đính kèm.
 * Contract: deleteSubmissionResponseSchema.
 */
export const DELETE = withLearner<RouteParams>(async ({ learner, params }) => {
  await softDeleteSubmission(learner.id, params.id);
  return NextResponse.json({
    success: true,
    message: "Đã xoá bài làm và file âm thanh liên quan.",
  });
});
