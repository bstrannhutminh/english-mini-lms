import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  assessments,
  submissions,
  learningSessions,
  learners,
  feedbackVersions,
} from "@/db/schema";
import {
  getMonthlyUsageSummary,
  type MonthlyUsageSummary,
} from "./usage-summary";

export type { MonthlyUsageSummary } from "./usage-summary";

export interface AdminActivityItem {
  id: string;
  title: string;
  mode: string;
  durationMinutes: number | null;
  difficulty: string | null;
  reviewState: string;
  topic: string | null;
  updatedAt: Date;
}

export interface AdminFailedAssessmentItem {
  id: string;
  submissionId: string;
  learnerId: string;
  learnerName: string | null;
  activityTitle: string;
  activityMode: string;
  runVersion: number;
  status: string;
  createdAt: Date;
  submissionBodySnippet: string | null;
}

export interface AdminFlaggedFeedbackItem {
  id: string;
  submissionId: string;
  learnerId: string;
  learnerName: string | null;
  activityTitle: string;
  activityMode: string;
  reviewState: string;
  createdAt: Date;
  observations: unknown;
  submissionBodySnippet: string | null;
}

export interface AdminDashboardData {
  activities: AdminActivityItem[];
  failedAssessments: AdminFailedAssessmentItem[];
  flaggedFeedback: AdminFlaggedFeedbackItem[];
  usage: MonthlyUsageSummary;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  // 1. Danh sách activity + review_state
  const allActivities = await db
    .select({
      id: activities.id,
      title: activities.title,
      mode: activities.mode,
      durationMinutes: activities.durationMinutes,
      difficulty: activities.difficulty,
      reviewState: activities.reviewState,
      topic: activities.topic,
      updatedAt: activities.updatedAt,
    })
    .from(activities)
    .orderBy(desc(activities.updatedAt));

  // 2. Danh sách assessments failed
  const failedList = await db
    .select({
      id: assessments.id,
      submissionId: assessments.submissionId,
      learnerId: assessments.learnerId,
      learnerName: learners.displayName,
      activityTitle: activities.title,
      activityMode: activities.mode,
      runVersion: assessments.runVersion,
      status: assessments.status,
      createdAt: assessments.createdAt,
      submissionBody: submissions.body,
    })
    .from(assessments)
    .innerJoin(submissions, eq(assessments.submissionId, submissions.id))
    .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
    .innerJoin(activities, eq(learningSessions.activityId, activities.id))
    .leftJoin(learners, eq(assessments.learnerId, learners.id))
    .where(
      and(
        eq(assessments.status, "failed"),
        isNull(submissions.deletedAt)
      )
    )
    .orderBy(desc(assessments.createdAt))
    .limit(50);

  const formattedFailed = failedList.map((item) => ({
    ...item,
    submissionBodySnippet: item.submissionBody
      ? item.submissionBody.slice(0, 120) + (item.submissionBody.length > 120 ? "..." : "")
      : null,
  }));

  // 3. Danh sách nhận xét bị gắn cờ (reviewState === "under_review")
  const flaggedList = await db
    .select({
      id: feedbackVersions.id,
      submissionId: feedbackVersions.submissionId,
      learnerId: feedbackVersions.learnerId,
      learnerName: learners.displayName,
      activityTitle: activities.title,
      activityMode: activities.mode,
      reviewState: feedbackVersions.reviewState,
      createdAt: feedbackVersions.createdAt,
      observations: feedbackVersions.observations,
      submissionBody: submissions.body,
    })
    .from(feedbackVersions)
    .innerJoin(submissions, eq(feedbackVersions.submissionId, submissions.id))
    .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
    .innerJoin(activities, eq(learningSessions.activityId, activities.id))
    .leftJoin(learners, eq(feedbackVersions.learnerId, learners.id))
    .where(
      and(
        eq(feedbackVersions.reviewState, "under_review"),
        isNull(submissions.deletedAt)
      )
    )
    .orderBy(desc(feedbackVersions.createdAt))
    .limit(50);

  const formattedFlagged: AdminFlaggedFeedbackItem[] = flaggedList.map((item) => ({
    ...item,
    reviewState: item.reviewState || "under_review",
    submissionBodySnippet: item.submissionBody
      ? item.submissionBody.slice(0, 120) + (item.submissionBody.length > 120 ? "..." : "")
      : null,
  }));

  // 4. Tổng token tháng từ usage_events (xem usage-summary.ts)
  const usage = await getMonthlyUsageSummary();

  return {
    activities: allActivities,
    failedAssessments: formattedFailed,
    flaggedFeedback: formattedFlagged,
    usage,
  };
}
