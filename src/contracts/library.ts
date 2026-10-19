/**
 * Library contracts — approved learning content only.
 * Safety invariant: never expose questions_file / rubric_json / answers.
 * Shapes mirror src/server/library/service.ts (ActivityListItem,
 * TopicSummary, ActivityDetail).
 */
import { z } from "zod";
import { activityModeSchema } from "./common";

export const learningStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
]);
export type LearningStatus = z.infer<typeof learningStatusSchema>;

/** difficulty enum in src/db/schema.ts. */
export const difficultySchema = z.enum([
  "trial",
  "beginner",
  "intermediate",
  "advanced",
]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const activityListItemSchema = z.object({
  id: z.string(),
  slot: z.string().nullable(),
  mode: activityModeSchema,
  title: z.string(),
  objective: z.string().nullable(),
  durationMinutes: z.number().int().nullable(),
  difficulty: difficultySchema.nullable(),
  purpose: z.string().nullable(),
  output: z.string().nullable(),
  topic: z.string().nullable(),
  learningStatus: learningStatusSchema.optional(),
  submissionCount: z.number().int().optional(),
});
export type ActivityListItemContract = z.infer<typeof activityListItemSchema>;

export const activityListResponseSchema = z.object({
  items: z.array(activityListItemSchema),
});

export const topicSummarySchema = z.object({
  /** null = "Chưa phân loại" (uncategorized). */
  topic: z.string().nullable(),
  activityCount: z.number().int(),
  learnedCount: z.number().int(),
});
export type TopicSummary = z.infer<typeof topicSummarySchema>;

export const topicListResponseSchema = z.object({
  topics: z.array(topicSummarySchema),
});

export const sourceContextSchema = z.object({
  sourceTitle: z.string(),
  page: z.number().int().nullable(),
  excerpt: z.string().nullable().optional(),
});
export type SourceContext = z.infer<typeof sourceContextSchema>;

/** GET /library/[id] — detail view of a single approved activity. */
export const activityDetailSchema = z.object({
  id: z.string(),
  slot: z.string().nullable(),
  mode: activityModeSchema,
  title: z.string(),
  objective: z.string().nullable(),
  durationMinutes: z.number().int().nullable(),
  difficulty: difficultySchema.nullable(),
  purpose: z.string().nullable(),
  output: z.string().nullable(),
  topic: z.string().nullable(),
  promptText: z.string().nullable(),
  feedbackGuide: z.string().nullable(),
  sourceContext: sourceContextSchema.nullable().optional(),
});
export type ActivityDetailContract = z.infer<typeof activityDetailSchema>;
