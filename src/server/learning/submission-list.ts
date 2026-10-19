/**
 * Truy vấn danh sách bài nộp cho trang /my-work.
 * Tách khỏi route để route chỉ parse → service → map lỗi.
 * Mỗi submission join activity (mode/title/slot) + assessment mới nhất
 * (dedup theo runVersion cao nhất — 1 submission có thể chấm lại nhiều lần).
 */
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  submissions,
  learningSessions,
  activities,
  assessments,
} from "@/db/schema";
import type { SubmissionListItem } from "@/contracts/submission";

export async function listLearnerSubmissions(
  learnerId: string,
  modeFilter?: string | null
): Promise<SubmissionListItem[]> {
  const conditions = [
    eq(submissions.learnerId, learnerId),
    isNull(submissions.deletedAt),
  ];

  if (modeFilter && modeFilter !== "all") {
    conditions.push(
      eq(activities.mode, modeFilter as (typeof activities.$inferSelect)["mode"])
    );
  }

  const rows = await db
    .select({
      id: submissions.id,
      sessionId: submissions.sessionId,
      revision: submissions.revision,
      parentId: submissions.parentId,
      modality: submissions.modality,
      assisted: submissions.assisted,
      submittedAt: submissions.submittedAt,
      activityId: activities.id,
      activityTitle: activities.title,
      activityMode: activities.mode,
      activitySlot: activities.slot,
      assessmentId: assessments.id,
      assessmentStatus: assessments.status,
      assessmentRunVersion: assessments.runVersion,
    })
    .from(submissions)
    .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
    .innerJoin(activities, eq(learningSessions.activityId, activities.id))
    .leftJoin(assessments, eq(assessments.submissionId, submissions.id))
    .where(and(...conditions))
    .orderBy(desc(submissions.submittedAt), desc(assessments.runVersion));

  // Dedup theo submission.id — row đầu tiên đã là assessment run mới nhất
  const seen = new Set<string>();
  const items: SubmissionListItem[] = [];

  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    items.push({
      id: r.id,
      sessionId: r.sessionId,
      revision: r.revision,
      parentId: r.parentId,
      modality: r.modality,
      assisted: r.assisted,
      submittedAt: r.submittedAt.toISOString(),
      activityId: r.activityId,
      activityTitle: r.activityTitle,
      activityMode: r.activityMode,
      activitySlot: r.activitySlot,
      assessmentStatus: r.assessmentStatus ?? "not_assessed",
    });
  }

  return items;
}
