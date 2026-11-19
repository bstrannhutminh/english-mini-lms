import { eq, and, desc, gte, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, learningSessions, submissions, drafts, assessments, learners } from "@/db/schema";
import { selectLearningFocus } from "@/lib/learning-focus";
import { normalizeSkillMode, type PracticeContext } from "./pick-activity";

const learningFocusProfileSchema = z.object({
  priorities: z.array(z.string()).optional(),
  selfAssessment: z.object({
    writing: z.number().optional(), reading: z.number().optional(),
    speaking: z.number().optional(), listening: z.number().optional(),
  }).optional(),
});

export async function getLearnerPracticeContext(
  learnerId: string
): Promise<PracticeContext> {
  // Quy tắc (a): nháp dở chưa nộp
  const [latestDraft] = await db
    .select({
      sessionId: drafts.sessionId,
      activityId: learningSessions.activityId,
    })
    .from(drafts)
    .innerJoin(learningSessions, eq(drafts.sessionId, learningSessions.id))
    .where(
      and(
        eq(drafts.learnerId, learnerId),
        eq(learningSessions.status, "active"),
        sql`length(coalesce(${drafts.content}, '')) > 20`
      )
    )
    .orderBy(desc(drafts.updatedAt))
    .limit(1);

  // Quy tắc (a): bài Bản 1 cần sửa (chưa có Bản 2 và ĐÃ CÓ nhận xét AI feedback_ready)
  const recentSubmissions = await db
    .select({
      id: submissions.id,
      revision: submissions.revision,
      activityId: learningSessions.activityId,
      parentId: submissions.parentId,
      assessmentStatus: assessments.status,
    })
    .from(submissions)
    .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
    .leftJoin(assessments, eq(assessments.submissionId, submissions.id))
    .where(
      and(eq(submissions.learnerId, learnerId), isNull(submissions.deletedAt))
    )
    .orderBy(desc(submissions.submittedAt))
    .limit(20);

  const parentIds = new Set(
    recentSubmissions.map((s) => s.parentId).filter(Boolean)
  );
  const unrevised = recentSubmissions.find(
    (s) =>
      s.revision === 1 &&
      !parentIds.has(s.id) &&
      s.assessmentStatus === "feedback_ready"
  );

  // Quy tắc (c): cân bằng 4 kỹ năng trong 7 ngày qua
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklySubmissions = await db
    .select({ mode: activities.mode })
    .from(submissions)
    .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
    .innerJoin(activities, eq(learningSessions.activityId, activities.id))
    .where(
      and(
        eq(submissions.learnerId, learnerId),
        isNull(submissions.deletedAt),
        gte(submissions.submittedAt, sevenDaysAgo)
      )
    );

  const skillCounts: Record<string, number> = {
    writing: 0,
    reading: 0,
    speaking: 0,
    listening: 0,
  };
  for (const s of weeklySubmissions) {
    const norm = normalizeSkillMode(s.mode);
    if (norm && skillCounts[norm] !== undefined) {
      skillCounts[norm]++;
    }
  }

  const [learner] = await db.select({ goals: learners.goals }).from(learners)
    .where(eq(learners.id, learnerId)).limit(1);
  const parsed = learningFocusProfileSchema.safeParse(learner?.goals ?? {});
  const profile = parsed.success ? parsed.data : {};
  const hasProfile = Boolean(profile.priorities?.length || profile.selfAssessment);

  // Kỹ năng ít luyện nhất lên đầu
  const sortedSkills = Object.entries(skillCounts).sort((a, b) => a[1] - b[1]);

  return {
    latestDraft:
      latestDraft && latestDraft.activityId
        ? { sessionId: latestDraft.sessionId, activityId: latestDraft.activityId }
        : null,
    unrevisedSubmission:
      unrevised && unrevised.activityId
        ? { id: unrevised.id, activityId: unrevised.activityId }
        : null,
    skillCounts,
    leastPracticedMode: hasProfile ? selectLearningFocus(skillCounts, profile) : sortedSkills[0][0],
    learningProfile: hasProfile ? profile : undefined,
  };
}
