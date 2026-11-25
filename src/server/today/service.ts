import {
  pickRecommendedActivity,
  SKILL_NAMES_VI,
  type RecommendedActivity,
} from "./pick-activity";
import { buildDailyPlan, type PlanStep } from "./daily-plan";
import {
  buildWeekActivity,
  computeStreakDays,
  computeWeekMinutes,
  type WeekDayActivity,
} from "./streak";
import { fetchTodayInputs } from "./fetch-today-inputs";

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

  // Các truy vấn độc lập chạy song song trong fetch-today-inputs.ts.
  const {
    learner,
    dueVocabCount,
    ctx,
    approvedActs,
    completedSessions,
    inProgress,
    todaySubs,
  } = await fetchTodayInputs(learnerId, now);

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
  const weekMinutes = computeWeekMinutes(completedSessions, now);

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
