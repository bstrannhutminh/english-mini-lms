/**
 * Admin content-management contracts — /api/v1/admin/**.
 * Admin sees the full DB rows (including questions/rubric that learner
 * endpoints must never expose). Response field names match current routes:
 * {activities}/{activity}, {sources}/{source}, {segments}/{segment}.
 */
import { z } from "zod";
import { activityModeSchema, isoDateTimeSchema } from "./common";
import { difficultySchema } from "./library";
import { feedbackObservationSchema } from "./submission";

export const reviewStateSchema = z.enum([
  "draft",
  "reviewing",
  "approved",
  "rejected",
  "retired",
]);
export type ReviewState = z.infer<typeof reviewStateSchema>;

export const answerRevealSchema = z.enum(["none", "after_submit", "on_request"]);
export type AnswerReveal = z.infer<typeof answerRevealSchema>;

/* ── Listening questions (admin editor) — matches src/lib/listening-questions.ts ── */

export const listeningQuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export const listeningQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(listeningQuestionOptionSchema),
  correct_option_id: z.string(),
  explanation: z.string().optional(),
  timestamp_reference: z.number().optional(),
});
export type ListeningQuestion = z.infer<typeof listeningQuestionSchema>;

/* ── DB rows (admin views) ── */

export const adminSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.string(),
  permission: z.string().nullable(),
  locatorType: z.string().nullable(),
  url: z.string().nullable(),
  reviewState: reviewStateSchema,
  notes: z.string().nullable(),
  origin: z.string().nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type AdminSource = z.infer<typeof adminSourceSchema>;

export const adminSegmentSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  page: z.number().int().nullable(),
  startSeconds: z.number().int().nullable(),
  endSeconds: z.number().int().nullable(),
  textContent: z.string().nullable(),
  transcriptContent: z.string().nullable(),
  verifiedTranscript: z.boolean().nullable(),
  language: z.string().nullable(),
  checksum: z.string().nullable(),
  origin: z.string().nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type AdminSegment = z.infer<typeof adminSegmentSchema>;

export const adminActivitySchema = z.object({
  id: z.string(),
  slot: z.string().nullable(),
  mode: activityModeSchema,
  title: z.string(),
  objective: z.string().nullable(),
  durationMinutes: z.number().int().nullable(),
  difficulty: difficultySchema.nullable(),
  promptText: z.string().nullable(),
  feedbackGuide: z.string().nullable(),
  // JSONB columns — admin-edited free-form payloads (rubric, segment refs, questions).
  rubricJson: z.unknown().nullable(),
  answerReveal: answerRevealSchema.nullable(),
  purpose: z.string().nullable(),
  reviewState: reviewStateSchema,
  segmentIds: z.array(z.string()).nullable(),
  questionsFile: z.string().nullable(),
  questions: z.array(listeningQuestionSchema).nullable(),
  output: z.string().nullable(),
  topic: z.string().nullable(),
  origin: z.string().nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type AdminActivity = z.infer<typeof adminActivitySchema>;

/* ── Request bodies (admin CRUD) — validated fields mirror the DB columns ── */

export const adminActivityCreateSchema = z.object({
  id: z.string().min(1),
  mode: activityModeSchema,
  title: z.string().min(1),
  slot: z.string().optional(),
  objective: z.string().optional(),
  durationMinutes: z.number().int().optional(),
  difficulty: difficultySchema.optional(),
  promptText: z.string().optional(),
  feedbackGuide: z.string().optional(),
  rubricJson: z.unknown().optional(),
  answerReveal: answerRevealSchema.optional(),
  purpose: z.string().optional(),
  reviewState: reviewStateSchema.optional(),
  segmentIds: z.array(z.string()).optional(),
  questionsFile: z.string().optional(),
  questions: z.array(listeningQuestionSchema).optional(),
  output: z.string().optional(),
  topic: z.string().optional(),
});
export type AdminActivityCreate = z.infer<typeof adminActivityCreateSchema>;

export const adminActivityUpdateSchema = adminActivityCreateSchema
  .omit({ id: true })
  .partial();
export type AdminActivityUpdate = z.infer<typeof adminActivityUpdateSchema>;

export const adminSourceCreateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.string().min(1),
  permission: z.string().optional(),
  locatorType: z.string().optional(),
  url: z.string().optional(),
  reviewState: reviewStateSchema.optional(),
  notes: z.string().optional(),
});
export const adminSourceUpdateSchema = adminSourceCreateSchema
  .omit({ id: true })
  .partial();

export const adminSegmentCreateSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  page: z.number().int().optional(),
  startSeconds: z.number().int().optional(),
  endSeconds: z.number().int().optional(),
  textContent: z.string().optional(),
  transcriptContent: z.string().optional(),
  verifiedTranscript: z.boolean().optional(),
  language: z.string().optional(),
  checksum: z.string().optional(),
});
export const adminSegmentUpdateSchema = adminSegmentCreateSchema
  .omit({ id: true })
  .partial();

/* ── List/detail responses ── */

export const adminActivityListResponseSchema = z.object({
  activities: z.array(adminActivitySchema),
});
export const adminActivityResponseSchema = z.object({
  activity: adminActivitySchema,
});
export const adminSourceListResponseSchema = z.object({
  sources: z.array(adminSourceSchema),
});
export const adminSourceResponseSchema = z.object({
  source: adminSourceSchema,
});
export const adminSegmentListResponseSchema = z.object({
  segments: z.array(adminSegmentSchema),
});
export const adminSegmentResponseSchema = z.object({
  segment: adminSegmentSchema,
});

// Re-export for admin feedback-review screens that parse observations.
export { feedbackObservationSchema };
