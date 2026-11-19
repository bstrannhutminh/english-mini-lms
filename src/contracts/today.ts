/**
 * "Hôm nay" contracts — GET /api/v1/today (also rendered server-side by
 * the /today page). Shapes mirror TodayRecommendation in
 * src/server/today/service.ts and RecommendedActivity in pick-activity.ts.
 */
import { z } from "zod";
import { uuidSchema } from "./common";
import { targetMinutesSchema } from "./session";

/** What the learner should do with the recommended activity. */
export const actionTypeSchema = z.enum([
  "continue_draft",
  "start_revision",
  "new_session",
]);
export type ActionType = z.infer<typeof actionTypeSchema>;

export const recommendedActivitySchema = z.object({
  id: z.string(),
  slot: z.string().nullable(),
  title: z.string(),
  mode: z.string(),
  objective: z.string().nullable(),
  durationMinutes: z.number().int(),
  reason: z.string(),
  actionType: actionTypeSchema,
  /** Present when actionType === "continue_draft". */
  sessionId: uuidSchema.optional(),
  /** Present when actionType === "start_revision". */
  parentId: uuidSchema.optional(),
});
export type RecommendedActivity = z.infer<typeof recommendedActivitySchema>;

export const alternateActivitySchema = z.object({
  id: z.string(),
  slot: z.string().nullable(),
  title: z.string(),
  mode: z.string(),
  objective: z.string().nullable(),
  durationMinutes: z.number().int(),
  reason: z.string(),
});
export type AlternateActivity = z.infer<typeof alternateActivitySchema>;

export const inProgressSessionSchema = z.object({
  sessionId: uuidSchema,
  activityId: z.string(),
  targetMinutes: z.number().int(),
  status: z.enum(["active", "paused"]),
  title: z.string(),
  mode: z.string(),
  slot: z.string().nullable(),
});
export type InProgressSession = z.infer<typeof inProgressSessionSchema>;

/* ── Kế hoạch phiên (buildDailyPlan — src/server/today/daily-plan.ts) ──
 * 4 bước cố định: Ôn từ (≤5') → Bài chính → Sửa/vận dụng → Kết thúc.
 * Mỗi bước là deep-link, trạng thái suy ra từ dữ liệu hôm nay (D-5: không
 * bảng mới). `description` luôn giải thích lý do bằng tiếng Việt. */
export const planStepKeySchema = z.enum([
  "warmup",
  "main",
  "revise",
  "wrapup",
]);
export type PlanStepKey = z.infer<typeof planStepKeySchema>;

export const planStepStatusSchema = z.enum(["done", "current", "upcoming"]);
export type PlanStepStatus = z.infer<typeof planStepStatusSchema>;

export const planStepSchema = z.object({
  key: planStepKeySchema,
  /** Nhãn tiếng Việt của bước. */
  title: z.string(),
  /** Lý do/mô tả tiếng Việt (rule-based, giải thích được). */
  description: z.string(),
  /** Ngân sách phút trong khung 30'/45'. */
  estimatedMinutes: z.number().int(),
  /** Deep-link tới màn của bước; null khi chưa có đích rõ. */
  href: z.string().nullable(),
  status: planStepStatusSchema,
});
export type PlanStep = z.infer<typeof planStepSchema>;

export const todayRecommendationSchema = z.object({
  learnerName: z.string(),
  baselineStatus: z.string(),
  targetMinutes: targetMinutesSchema,
  reason: z.string(),
  recommendedActivity: recommendedActivitySchema.nullable(),
  alternateActivities: z.array(alternateActivitySchema),
  dueVocabCount: z.number().int(),
  /** Vietnamese display name of the least-practiced skill. */
  leastPracticedSkill: z.string(),
  streakDays: z.number().int(),
  inProgressSession: inProgressSessionSchema.nullable(),
  /** Kế hoạch phiên 4 bước suy ra từ dữ liệu hôm nay. */
  dailyPlan: z.array(planStepSchema),
});
export type TodayRecommendationContract = z.infer<typeof todayRecommendationSchema>;
