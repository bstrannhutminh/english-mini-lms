/**
 * Đọc bài nộp + feedback cho trang /my-work/[submissionId].
 * Đây là một trong hai "điểm quan sát" của sweeper: assessment nào kẹt
 * queued/processing quá STUCK_ASSESSMENT_MS sẽ bị đánh failed khi learner
 * mở trang → UI hiển thị trạng thái thật + nút "Chấm lại".
 */
import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  learningSessions,
  submissions,
  assessments,
  feedbackVersions,
  activities,
  mediaObjects,
} from "@/db/schema";
import type { WritingFeedback } from "@/server/providers/gemini";
import { getMediaSignedUrl } from "@/server/media/service";
import { sweepStuckAssessment } from "./assessment-status";

const AUDIO_URL_TTL_SECONDS = 600;

type AssessmentRow = typeof assessments.$inferSelect;
type SubmissionRow = typeof submissions.$inferSelect;

/**
 * Shape feedback đọc từ feedback_versions (JSONB). Pronunciation (speaking)
 * nằm trong rubricSnapshot; transcript không được persist — trường hợp cũ
 * giữ nguyên. Views thu hẹp kiểu theo mode của riêng chúng.
 */
export interface SerializedFeedback extends WritingFeedback {
  id: string;
  reviewState: string | null;
  pronunciation: {
    status: "assessed" | "not_assessable";
    notes: string;
  } | null;
}

async function signedAudioUrl(mediaId: string | null): Promise<string | null> {
  if (!mediaId) return null;
  const [media] = await db
    .select({ storageKey: mediaObjects.storageKey })
    .from(mediaObjects)
    .where(eq(mediaObjects.id, mediaId))
    .limit(1);
  if (!media) return null;
  try {
    return await getMediaSignedUrl(media.storageKey, AUDIO_URL_TTL_SECONDS);
  } catch (e) {
    console.warn("Could not generate signed url for submission audio:", e);
    return null;
  }
}

async function latestAssessment(submissionId: string): Promise<AssessmentRow | null> {
  const [row] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.submissionId, submissionId))
    .orderBy(desc(assessments.createdAt))
    .limit(1);
  return row ?? null;
}

async function latestFeedback(assessment: AssessmentRow | null): Promise<SerializedFeedback | null> {
  if (!assessment || assessment.status !== "feedback_ready") return null;

  const [fb] = await db
    .select()
    .from(feedbackVersions)
    .where(eq(feedbackVersions.assessmentId, assessment.id))
    .orderBy(desc(feedbackVersions.createdAt))
    .limit(1);

  if (!fb) return null;

  const rubricSnap = fb.rubricSnapshot as {
    pronunciation?: SerializedFeedback["pronunciation"];
  } | null;
  return {
    id: fb.id,
    reviewState: fb.reviewState,
    observations: (fb.observations as WritingFeedback["observations"]) || [],
    strengths: (fb.strengths as string[]) || [],
    next_action: fb.nextAction || "",
    limitations: fb.limitations || "",
    scores: (fb.scores as WritingFeedback["scores"]) || [],
    pronunciation: rubricSnap?.pronunciation ?? null,
  };
}

async function submissionBundle(sub: SubmissionRow) {
  const [assessment, audioUrl] = await Promise.all([
    latestAssessment(sub.id),
    signedAudioUrl(sub.mediaId),
  ]);
  // Sweeper: đọc trạng thái là lúc rẻ nhất để phát hiện assessment chết.
  const sweptAssessment = assessment ? await sweepStuckAssessment(assessment) : null;
  const feedback = await latestFeedback(sweptAssessment);
  return {
    submission: { ...sub, audioUrl },
    assessment: sweptAssessment,
    feedback,
  };
}

export async function getSubmissionWithFeedback(submissionId: string, learnerId: string) {
  const [sub] = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.id, submissionId),
        eq(submissions.learnerId, learnerId),
        isNull(submissions.deletedAt)
      )
    )
    .limit(1);

  if (!sub) {
    return null;
  }

  const [session] = await db
    .select({
      activityId: learningSessions.activityId,
      targetMinutes: learningSessions.targetMinutes,
    })
    .from(learningSessions)
    .where(eq(learningSessions.id, sub.sessionId))
    .limit(1);

  const [activity] = await db
    .select({
      id: activities.id,
      slot: activities.slot,
      title: activities.title,
      mode: activities.mode,
      promptText: activities.promptText,
    })
    .from(activities)
    .where(eq(activities.id, session.activityId))
    .limit(1);

  const current = await submissionBundle(sub);

  // Nếu là bản sửa (có parentId) → lấy luôn Bản 1 + feedback Bản 1 để so sánh
  let parentSubmissionData = null;
  if (sub.parentId) {
    const [parentSub] = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.id, sub.parentId),
          eq(submissions.learnerId, sub.learnerId),
          isNull(submissions.deletedAt)
        )
      )
      .limit(1);

    if (parentSub) {
      const parent = await submissionBundle(parentSub);
      parentSubmissionData = {
        submission: parent.submission,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSONB: shape khác nhau theo skill (Writing/Speaking); giữ kiểu trả về như code cũ, view tự thu hẹp
        feedback: parent.feedback as any,
      };
    }
  }

  return {
    submission: current.submission,
    session,
    activity,
    assessment: current.assessment,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSONB: shape khác nhau theo skill; view tự thu hẹp (trước đây cũng là any)
    feedback: current.feedback as any,
    parent: parentSubmissionData,
  };
}
