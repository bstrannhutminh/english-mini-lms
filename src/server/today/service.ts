import { eq, and, gte, isNull, lte, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  vocabularyVault,
  learners,
  learningSessions,
  submissions,
} from "@/db/schema";
import {
  getLearnerPracticeContext,
  pickRecommendedActivity,
  SKILL_NAMES_VI,
  type RecommendedActivity,
} from "./pick-activity";
import {
  buildDailyPlan,
  startOfTodayVietnam,
  type PlanStep,
} from "./daily-plan";
import { buildWeekActivity, computeStreakDays, type WeekDayActivity } from "./streak";

export interface InProgressSessionInfo {
  sessionId: string;
  activityId: string;
  targetMinutes: number;
  status: "active" | "paused";
  title: string;
  mode: string;
  slot: string | null;
}

export interface TodayRecommendation {
  learnerName: string;
  baselineStatus: string;
  targetMinutes: 30 | 45;
  reason: string;
  recommendedActivity: RecommendedActivity | null;
  alternateActivities: Array<{
    id: string;
    slot: string | null;
    title: string;
    mode: string;
    objective: string | null;
    durationMinutes: number;
    reason: string;
  }>;
  dueVocabCount: number;
  leastPracticedSkill: string;
  streakDays: number;
  inProgressSession: InProgressSessionInfo | null;
  /** Kế hoạch phiên 4 bước (spec §3.3) — suy ra từ dữ liệu hôm nay, không bảng mới. */
  dailyPlan: PlanStep[];
  /** 7 ngày gần nhất, ngày nào có phiên hoàn thành (nhịp học, không phải điểm). */
  weekActivity: WeekDayActivity[];
  /** Tổng phút học chủ động của các phiên hoàn thành trong 7 ngày gần nhất. */
  weekMinutes: number;
}

export async function getTodayRecommendation(
  learnerId: string,
  targetMinutes: 30 | 45 = 30
): Promise<TodayRecommendation> {
  const now = new Date();

  // Các truy vấn độc lập chạy song song (trước đây nối tiếp 7 lượt chờ DB).
  const [
    [learner],
    dueVocabCount,
    ctx,
    approvedActs,
    completedSessions,
    [inProgress],
    todaySubs,
  ] = await Promise.all([
    // 1. Thông tin người học
    db
      .select({
        displayName: learners.displayName,
        baselineStatus: learners.baselineStatus,
      })
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1),
    // 2. Số từ vựng đến hạn ôn tập (Spaced Repetition)
    db.$count(
      vocabularyVault,
      and(eq(vocabularyVault.learnerId, learnerId), lte(vocabularyVault.dueAt, now))
    ),
    // 3. Ngữ cảnh luyện tập: nháp dở, bài cần sửa, cân bằng 4 kỹ năng (module dùng chung)
    getLearnerPracticeContext(learnerId),
    // 4. Danh sách các hoạt động đã được phê duyệt (approved)
    db
      .select({
        id: activities.id,
        slot: activities.slot,
        title: activities.title,
        mode: activities.mode,
        objective: activities.objective,
        durationMinutes: activities.durationMinutes,
      })
      .from(activities)
      .where(eq(activities.reviewState, "approved")),
    // 6. Các phiên đã hoàn thành — tính streak và nhịp 7 ngày
    db
      .select({
        updatedAt: learningSessions.updatedAt,
        activeSeconds: learningSessions.activeSeconds,
      })
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          eq(learningSessions.status, "completed")
        )
      )
      .orderBy(desc(learningSessions.updatedAt)),
    // 7. Phiên học đang dở (active hoặc paused) gần nhất
    db
      .select({
        sessionId: learningSessions.id,
        activityId: learningSessions.activityId,
        targetMinutes: learningSessions.targetMinutes,
        status: learningSessions.status,
        activityTitle: activities.title,
        activityMode: activities.mode,
        activitySlot: activities.slot,
      })
      .from(learningSessions)
      .innerJoin(activities, eq(learningSessions.activityId, activities.id))
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          inArray(learningSessions.status, ["active", "paused"])
        )
      )
      .orderBy(desc(learningSessions.updatedAt))
      .limit(1),
    // 8. Bài nộp "hôm nay" (mốc 00:00 giờ VN — cùng computeStreakDays) để
    // suy ra kế hoạch phiên: đã nộp bài chính chưa, đã sửa bản nào chưa.
    db
      .select({
        revision: submissions.revision,
        parentId: submissions.parentId,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.learnerId, learnerId),
          isNull(submissions.deletedAt),
          gte(submissions.submittedAt, startOfTodayVietnam())
        )
      ),
  ]);

  const learnerName = learner?.displayName || "Bác sĩ Minh";
  const baselineStatus = learner?.baselineStatus || "pending";
  const leastPracticedMode = ctx.leastPracticedMode;

  // 5. Lựa chọn bài tập chính được đề xuất (luật rule-based dùng chung với /library)
  const recommended = pickRecommendedActivity(approvedActs, ctx, targetMinutes);

  // Danh sách các bài tập thay thế khi bấm "Đổi bài khác"
  const alternateActivities = approvedActs
    .filter((a) => !recommended || a.id !== recommended.id)
    .map((a) => {
      let altReason = `Bài luyện kỹ năng ${SKILL_NAMES_VI[a.mode] || a.mode} phù hợp với quỹ thời gian ${targetMinutes} phút.`;
      if (a.mode === leastPracticedMode) {
        altReason = `Lựa chọn thay thế giúp rèn luyện kỹ năng ${SKILL_NAMES_VI[a.mode]} đang cần bổ sung.`;
      }
      return {
        id: a.id,
        slot: a.slot,
        title: a.title,
        mode: a.mode,
        objective: a.objective,
        durationMinutes: a.durationMinutes || 15,
        reason: altReason,
      };
    });

  const completedDates = completedSessions.map((s) => s.updatedAt);
  const streakDays = computeStreakDays(completedDates);
  const weekActivity = buildWeekActivity(completedDates, now);
  const weekStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const weekMinutes = Math.round(
    completedSessions
      .filter((s) => s.updatedAt.getTime() >= weekStart)
      .reduce((total, s) => total + (s.activeSeconds ?? 0), 0) / 60
  );

  const inProgressSession: InProgressSessionInfo | null = inProgress
    ? {
        sessionId: inProgress.sessionId,
        activityId: inProgress.activityId,
        targetMinutes: inProgress.targetMinutes,
        status: inProgress.status as "active" | "paused",
        title: inProgress.activityTitle,
        mode: inProgress.activityMode,
        slot: inProgress.activitySlot,
      }
    : null;

  const submittedToday = todaySubs.length > 0;
  const revisedToday = todaySubs.some(
    (s) => s.revision > 1 || s.parentId !== null
  );

  const dailyPlan = buildDailyPlan(
    {
      dueVocabCount,
      inProgressSessionId: inProgressSession?.sessionId ?? null,
      recommendedActivityId: recommended?.id ?? null,
      submittedToday,
      revisedToday,
      unrevisedSubmissionId: ctx.unrevisedSubmission?.id ?? null,
    },
    targetMinutes
  );

  return {
    learnerName,
    baselineStatus,
    targetMinutes,
    reason: recommended?.reason || "",
    recommendedActivity: recommended,
    alternateActivities,
    dueVocabCount,
    leastPracticedSkill: SKILL_NAMES_VI[leastPracticedMode] || leastPracticedMode,
    streakDays,
    inProgressSession,
    dailyPlan,
    weekActivity,
    weekMinutes,
  };
}
