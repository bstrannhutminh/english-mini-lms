/**
 * "Tiến độ" contract — GET /api/v1/progress (also rendered server-side by
 * the /progress page). Mirrors ProgressSummary in
 * src/server/progress/service.ts; date fields are ISO-8601 strings.
 */
import { z } from "zod";
import { isoDateTimeSchema, uuidSchema } from "./common";

export const skillCountSchema = z.object({
  skill: z.enum(["writing", "reading", "speaking", "listening"]),
  total: z.number().int(),
  independent: z.number().int(),
  assisted: z.number().int(),
});
export type SkillCountContract = z.infer<typeof skillCountSchema>;

export const recurringErrorCategorySchema = z.object({
  category: z.string(),
  count: z.number().int(),
  samples: z.array(z.string()),
});
export type RecurringErrorCategoryContract = z.infer<
  typeof recurringErrorCategorySchema
>;

export const revisionComparisonSchema = z.object({
  activityId: z.string(),
  activityTitle: z.string(),
  mode: z.string(),
  originalSubmissionId: uuidSchema,
  revisedSubmissionId: uuidSchema,
  originalDate: isoDateTimeSchema,
  revisedDate: isoDateTimeSchema,
  originalAssisted: z.boolean(),
  revisedAssisted: z.boolean(),
  originalExcerpt: z.string(),
  revisedExcerpt: z.string(),
});
export type RevisionComparisonContract = z.infer<
  typeof revisionComparisonSchema
>;

export const progressSummarySchema = z.object({
  sessionsThisWeek: z.number().int(),
  actualStudyMinutes: z.number().int(),
  totalSubmissions: z.number().int(),
  /** false khi < 3 bài nộp — không suy luận xu hướng từ dữ liệu ít. */
  hasSufficientData: z.boolean(),
  insufficientDataMessage: z.string().optional(),
  skillBreakdown: z.array(skillCountSchema),
  independentCount: z.number().int(),
  assistedCount: z.number().int(),
  recurringErrors: z.array(recurringErrorCategorySchema),
  masteredVocabCount: z.number().int(),
  totalVocabCount: z.number().int(),
  revisionComparisons: z.array(revisionComparisonSchema),
});
export type ProgressSummaryContract = z.infer<typeof progressSummarySchema>;
