/**
 * Admin content-management contracts — /api/v1/admin/**.
 * Admin sees the full DB rows (including questions/rubric that learner
 * endpoints must never expose). Request schemas are strict: route-level
 * validation owns field type/shape; business rules stay in services.
 */
import { z } from "zod";
import { activityModeSchema, isoDateTimeSchema } from "./common";
import { difficultySchema } from "./library";

export const reviewStateSchema = z.enum(["draft", "reviewing", "approved", "rejected", "retired"]);
export type ReviewState = z.infer<typeof reviewStateSchema>;

export const answerRevealSchema = z.enum(["none", "after_submit", "on_request"]);
export type AnswerReveal = z.infer<typeof answerRevealSchema>;

export const activityPurposeSchema = z.enum(["baseline", "practice", "assessment"]);
export type ActivityPurpose = z.infer<typeof activityPurposeSchema>;

export const activityOutputSchema = z.enum(["text", "audio"]);
export type ActivityOutput = z.infer<typeof activityOutputSchema>;

export const sourceKindSchema = z.enum(["book", "video", "audio", "article", "self-authored"]);
export type SourceKind = z.infer<typeof sourceKindSchema>;

export const locatorTypeSchema = z.enum(["page", "seconds"]);
export type LocatorType = z.infer<typeof locatorTypeSchema>;

/* ── Câu hỏi nghe (admin editor) — khớp src/lib/listening-questions.ts ── */

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

/* ── Request bodies ──
 * `nullish` có chủ đích: PATCH dùng null để xoá giá trị optional; thiếu key
 * nghĩa là không thay đổi. questionsFile/origin/id không thuộc payload sửa.
 */

const activityEditableFields = {
  slot: z.string().nullish(),
  objective: z.string().nullish(),
  durationMinutes: z.number().int().nullish(),
  difficulty: difficultySchema.nullish(),
  promptText: z.string().nullish(),
  feedbackGuide: z.string().nullish(),
  rubricJson: z.record(z.string(), z.unknown()).nullish(),
  answerReveal: answerRevealSchema.nullish(),
  purpose: activityPurposeSchema.nullish(),
  reviewState: reviewStateSchema.optional(),
  segmentIds: z.array(z.string()).optional(),
  questions: z.array(listeningQuestionSchema).optional(),
  output: activityOutputSchema.nullish(),
  topic: z.string().nullish(),
} as const;

export const adminActivityCreateSchema = z
  .object({
    id: z.string().min(1),
    mode: activityModeSchema,
    title: z.string().min(1),
    ...activityEditableFields,
  })
  .strict();
export type AdminActivityCreate = z.infer<typeof adminActivityCreateSchema>;

export const adminActivityUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  ...activityEditableFields,
}).partial().strict();
export type AdminActivityUpdate = z.infer<typeof adminActivityUpdateSchema>;

const sourceEditableFields = {
  permission: z.string().nullish(),
  locatorType: locatorTypeSchema.nullish(),
  url: z.string().nullish(),
  reviewState: reviewStateSchema.optional(),
  notes: z.string().nullish(),
} as const;

export const adminSourceCreateSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    kind: sourceKindSchema,
    ...sourceEditableFields,
  })
  .strict();
export type AdminSourceCreate = z.infer<typeof adminSourceCreateSchema>;

export const adminSourceUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  kind: sourceKindSchema.optional(),
  ...sourceEditableFields,
}).partial().strict();
export type AdminSourceUpdate = z.infer<typeof adminSourceUpdateSchema>;

const segmentEditableFields = {
  page: z.number().int().nullish(),
  startSeconds: z.number().int().nullish(),
  endSeconds: z.number().int().nullish(),
  textContent: z.string().nullish(),
  transcriptContent: z.string().nullish(),
  verifiedTranscript: z.boolean().optional(),
  language: z.string().nullish(),
  checksum: z.string().nullish(),
} as const;

export const adminSegmentCreateSchema = z
  .object({
    id: z.string().min(1),
    sourceId: z.string().min(1),
    ...segmentEditableFields,
  })
  .strict();
export type AdminSegmentCreate = z.infer<typeof adminSegmentCreateSchema>;

export const adminSegmentUpdateSchema = z.object(segmentEditableFields).partial().strict();
export type AdminSegmentUpdate = z.infer<typeof adminSegmentUpdateSchema>;

/* ── List/detail responses ── */

export const adminActivityListResponseSchema = z.object({ activities: z.array(adminActivitySchema) });
export const adminActivityResponseSchema = z.object({ activity: adminActivitySchema });
export const adminSourceListResponseSchema = z.object({ sources: z.array(adminSourceSchema) });
export const adminSourceResponseSchema = z.object({ source: adminSourceSchema });
export const adminSegmentListResponseSchema = z.object({ segments: z.array(adminSegmentSchema) });
export const adminSegmentResponseSchema = z.object({ segment: adminSegmentSchema });
