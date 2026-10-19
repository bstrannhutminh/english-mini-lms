/**
 * Pipeline "Nộp bài → chấm AI" (POST /api/v1/sessions/[id]/submissions):
 *   1. build input — session + activity, giới hạn body, media ready cho
 *      skill=speaking, assisted TÍNH SERVER-SIDE từ session_events
 *      (hint/reveal) — client không bao giờ được gửi trường assisted.
 *   2. append — submissions APPEND-ONLY (revision = parent.revision + 1).
 *   3. evaluate — evaluateSubmission (dispatcher theo modeSkill).
 *   4. persist — feedback_versions + error_observations + usage_events.
 *   5. status — feedback_ready | failed (bài nộp luôn được giữ lại).
 */
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  learningSessions,
  submissions,
  assessments,
  activities,
  sessionEvents,
} from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import { ValidationError } from "../errors";
import { MAX_SUBMISSION_BODY_CHARS } from "../limits";
import { loadReadyMedia } from "./submission-media";
import { toVietnameseGeminiError } from "@/server/providers/gemini/call-gemini";
import { evaluateSubmission } from "./evaluate-submission";
import { persistEvaluationResult } from "./persist-evaluation";
import {
  markAssessmentProcessing,
  markAssessmentReady,
  markAssessmentFailed,
} from "./assessment-status";

export async function createSubmissionAndAssess(
  sessionId: string,
  learnerId: string,
  body?: string,
  parentId?: string,
  mediaId?: string
) {
  // ── 1. Build input ──────────────────────────────────────────────
  const [session] = await db
    .select({
      id: learningSessions.id,
      activityId: learningSessions.activityId,
    })
    .from(learningSessions)
    .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
    .limit(1);

  if (!session) {
    throw new ValidationError("Không tìm thấy phiên học.", 404);
  }

  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, session.activityId))
    .limit(1);

  if (!activity) {
    throw new ValidationError("Không tìm thấy bài học liên kết.", 404);
  }

  // Giới hạn độ dài body phía server (contract route cũng chặn 20.000).
  if (body && body.length > MAX_SUBMISSION_BODY_CHARS) {
    throw new ValidationError(
      `Nội dung bài nộp quá dài (tối đa ${MAX_SUBMISSION_BODY_CHARS.toLocaleString("vi-VN")} ký tự).`,
      422
    );
  }

  const skill = modeSkill(activity.mode);

  // Siết validation theo SKILL — ielts-writing cũng bắt buộc body như writing.
  if (skill === "writing" && (!body || body.trim().length === 0)) {
    throw new ValidationError("Bài viết không được để trống.", 422);
  }

  if (skill === "speaking" && !mediaId) {
    throw new ValidationError(
      "Nộp bài Speaking bắt buộc phải có tệp âm thanh (media_id).",
      422
    );
  }

  // Media phải ready + thuộc learner + ≤ 300s khi có gắn media.
  if (mediaId) {
    await loadReadyMedia(mediaId, learnerId);
  }

  // Kiểm tra hint hoặc reveal event trong session → assisted (server-computed)
  const [assistEvent] = await db
    .select({ id: sessionEvents.id })
    .from(sessionEvents)
    .where(
      and(
        eq(sessionEvents.sessionId, sessionId),
        inArray(sessionEvents.kind, ["hint", "reveal"])
      )
    )
    .limit(1);

  const isAssisted = !!assistEvent;

  // Xác định revision từ bài cha và validate chặt chẽ
  let revision = 1;
  if (parentId) {
    const [parent] = await db
      .select({
        id: submissions.id,
        revision: submissions.revision,
        learnerId: submissions.learnerId,
        deletedAt: submissions.deletedAt,
        activityId: learningSessions.activityId,
      })
      .from(submissions)
      .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
      .where(eq(submissions.id, parentId))
      .limit(1);

    if (!parent) {
      throw new ValidationError("Bài viết gốc (parentId) không tồn tại.", 404);
    }
    if (parent.learnerId !== learnerId) {
      throw new ValidationError("Không có quyền tạo bản sửa đổi cho bài nộp của người khác.", 403);
    }
    if (parent.deletedAt) {
      throw new ValidationError("Bài viết gốc đã bị xóa.", 422);
    }
    if (parent.activityId !== session.activityId) {
      throw new ValidationError("Bài viết gốc không cùng bài học với phiên hiện tại.", 422);
    }
    revision = parent.revision + 1;
  }

  // ── 2. Append submission (không bao giờ UPDATE bài đã nộp) ──────
  const modality = activity.output === "audio" || mediaId ? "audio" : "text";

  const [submission] = await db
    .insert(submissions)
    .values({
      sessionId,
      learnerId,
      revision,
      parentId: parentId || null,
      modality,
      body: body || null,
      mediaId: mediaId || null,
      assisted: isAssisted,
    })
    .returning();

  const [assessment] = await db
    .insert(assessments)
    .values({
      submissionId: submission.id,
      learnerId,
      kind: "ai_feedback",
      runVersion: 1,
      status: "queued",
    })
    .returning();

  await markAssessmentProcessing(assessment.id);

  // ── 3. Evaluate + 4. Persist + 5. Status ─────────────────────────
  try {
    const outcome = await evaluateSubmission(activity, {
      body: submission.body,
      mediaId: submission.mediaId,
      confirmedTranscript: submission.confirmedTranscript,
    });

    const feedback = await persistEvaluationResult({
      assessmentId: assessment.id,
      learnerId,
      submissionId: submission.id,
      runVersion: 1,
      activityMode: activity.mode,
      rubricJson: activity.rubricJson,
      outcome,
    });

    await markAssessmentReady(assessment.id);

    await db
      .update(learningSessions)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(learningSessions.id, sessionId));

    return {
      submission,
      assessment: { ...assessment, status: "feedback_ready" as const },
      feedback,
    };
  } catch (evalError) {
    console.error("Lỗi khi gọi AI chấm bài:", evalError);

    // Chuẩn hoá qua toVietnameseGeminiError: EnvError (thiếu GEMINI_API_KEY)
    // không được lộ tên biến môi trường cho người học — chi tiết ở log trên.
    const resultRef = toVietnameseGeminiError(evalError).message;
    await markAssessmentFailed(assessment.id, resultRef);

    return {
      submission,
      assessment: { ...assessment, status: "failed" as const, resultRef },
      feedback: null,
    };
  }
}
