import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  assessments,
  feedbackVersions,
  learningSessions,
  sessionEvents,
  submissions,
} from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import { ValidationError } from "../errors";

/**
 * Append submission trong transaction có khoá hàng session.
 *
 * Race/double-click/retry mạng đều đi qua cùng một khoá này: request thứ hai
 * chỉ đọc session sau khi request đầu commit, nhìn thấy submission cùng
 * session+revision và được trả lại idempotently nếu payload giống hệt.
 * Submission đã soft-delete không chặn tạo mới.
 */
export async function insertOrReuseSubmission(input: {
  sessionId: string;
  learnerId: string;
  body?: string;
  parentId?: string;
  mediaId?: string;
}) {
  const { sessionId, learnerId, body, parentId, mediaId } = input;

  return db.transaction(async (tx) => {
    const [session] = await tx
      .select({
        id: learningSessions.id,
        activityId: learningSessions.activityId,
        status: learningSessions.status,
      })
      .from(learningSessions)
      .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
      .limit(1)
      .for("update");

    if (!session) throw new ValidationError("Không tìm thấy phiên học.", 404);

    const [activity] = await tx
      .select()
      .from(activities)
      .where(eq(activities.id, session.activityId))
      .limit(1);
    if (!activity) throw new ValidationError("Không tìm thấy bài học liên kết.", 404);

    const skill = modeSkill(activity.mode);
    if (skill === "writing" && (!body || body.trim().length === 0)) {
      throw new ValidationError("Bài viết không được để trống.", 422);
    }
    if (skill === "speaking" && !mediaId && (!body || body.trim().length === 0)) {
      throw new ValidationError("Bài speaking cần có ghi âm hoặc transcript/notes dạng text.", 422);
    }

    const [assistEvent] = await tx
      .select({ id: sessionEvents.id })
      .from(sessionEvents)
      .where(and(eq(sessionEvents.sessionId, sessionId), inArray(sessionEvents.kind, ["hint", "reveal"])))
      .limit(1);
    const isAssisted = !!assistEvent;

    let revision = 1;
    if (parentId) {
      const [parent] = await tx
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

      if (!parent) throw new ValidationError("Bài viết gốc (parentId) không tồn tại.", 404);
      if (parent.learnerId !== learnerId) {
        throw new ValidationError("Không có quyền tạo bản sửa đổi cho bài nộp của người khác.", 403);
      }
      if (parent.deletedAt) throw new ValidationError("Bài viết gốc đã bị xóa.", 422);
      if (parent.activityId !== session.activityId) {
        throw new ValidationError("Bài viết gốc không cùng bài học với phiên hiện tại.", 422);
      }
      revision = parent.revision + 1;
    }

    const [existing] = await tx
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.sessionId, sessionId),
          eq(submissions.revision, revision),
          isNull(submissions.deletedAt)
        )
      )
      .limit(1);

    if (existing) {
      const samePayload =
        (existing.body ?? "") === (body ?? "") &&
        (existing.mediaId ?? null) === (mediaId || null) &&
        (existing.parentId ?? null) === (parentId || null);

      if (!samePayload) {
        throw new ValidationError("Phiên học này đã có bài nộp khác nội dung. Không thể ghi đè bài đã nộp.", 409);
      }

      const [assessment] = await tx
        .select()
        .from(assessments)
        .where(eq(assessments.submissionId, existing.id))
        .orderBy(desc(assessments.runVersion), desc(assessments.createdAt))
        .limit(1);
      if (!assessment) {
        throw new ValidationError("Bài nộp đã tồn tại nhưng thiếu assessment. Vui lòng liên hệ quản trị.", 500);
      }

      const [feedback] = await tx
        .select()
        .from(feedbackVersions)
        .where(eq(feedbackVersions.assessmentId, assessment.id))
        .orderBy(desc(feedbackVersions.runVersion), desc(feedbackVersions.createdAt))
        .limit(1);

      return { submission: existing, assessment, feedback: feedback ?? null, activity, reused: true };
    }

    if (session.status === "completed") {
      throw new ValidationError("Phiên học đã hoàn thành, không thể nộp thêm bài mới.", 409);
    }

    const [submission] = await tx
      .insert(submissions)
      .values({
        sessionId,
        learnerId,
        revision,
        parentId: parentId || null,
        modality: mediaId ? "audio" : "text",
        body: body || null,
        mediaId: mediaId || null,
        assisted: isAssisted,
      })
      .returning();

    const [assessment] = await tx
      .insert(assessments)
      .values({ submissionId: submission.id, learnerId, kind: "ai_feedback", runVersion: 1, status: "queued" })
      .returning();

    return { submission, assessment, feedback: null, activity, reused: false };
  });
}
