import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { activities, learners, learningSessions, submissions } from "@/db/schema";

/**
 * Dữ liệu cho trang Cài đặt: hồ sơ learner + danh sách bài nộp gần đây
 * (chưa xoá) để quản lý/xoá theo yêu cầu. learner_id luôn từ session.
 * Trả về row thô — NextResponse.json serialize Date → ISO; client parse qua
 * contracts/settings.ts (settingsResponseSchema).
 */
export async function getSettingsOverview(learnerId: string) {
  const [profile] = await db
    .select({
      id: learners.id,
      displayName: learners.displayName,
      role: learners.role,
      preferences: learners.preferences,
      timezone: learners.timezone,
      createdAt: learners.createdAt,
    })
    .from(learners)
    .where(eq(learners.id, learnerId))
    .limit(1);

  const recentSubmissions = await db
    .select({
      id: submissions.id,
      revision: submissions.revision,
      createdAt: submissions.createdAt,
      mediaId: submissions.mediaId,
      activityId: activities.id,
      activityTitle: activities.title,
      activityMode: activities.mode,
    })
    .from(submissions)
    .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
    .innerJoin(activities, eq(learningSessions.activityId, activities.id))
    .where(and(eq(submissions.learnerId, learnerId), isNull(submissions.deletedAt)))
    .orderBy(desc(submissions.createdAt))
    .limit(50);

  return {
    learner: profile ?? null,
    submissions: recentSubmissions,
  };
}
