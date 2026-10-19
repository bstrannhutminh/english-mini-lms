/**
 * Submission / assessment / feedback contracts.
 * Locks the learning-data invariants: observations carry the full
 * {location, original, issue, suggestion, example, retry_prompt} shape,
 * scores are always kind="practice_estimate" (never an official IELTS band),
 * and submissions stay append-only (revisions insert with parent_id).
 */
import { z } from "zod";
import { isoDateTimeSchema, uuidSchema } from "./common";

/* ── Feedback primitives (snake_case — the shape Gemini emits & DB stores) ── */

export const feedbackObservationSchema = z.object({
  category: z.string().optional(),
  location: z.string(),
  original: z.string(),
  issue: z.string(),
  suggestion: z.string(),
  example: z.string(),
  retry_prompt: z.string(),
  /** Set by POST /api/v1/feedback/[id]/flag — learner-flagged observation. */
  flagged: z.boolean().optional(),
  flaggedReason: z.string().optional(),
  flaggedAt: isoDateTimeSchema.optional(),
});
export type FeedbackObservation = z.infer<typeof feedbackObservationSchema>;

/** Invariant: only practice_estimate — the app never emits an official band. */
export const practiceScoreSchema = z.object({
  kind: z.literal("practice_estimate"),
  dimension: z.string(),
  value: z.number(),
  note: z.string().optional(),
});
export type PracticeScore = z.infer<typeof practiceScoreSchema>;

export const pronunciationResultSchema = z.object({
  /** `not_assessable` is required when speaking has no real audio (invariant). */
  status: z.enum(["assessed", "not_assessable"]),
  notes: z.string(),
});
export type PronunciationResult = z.infer<typeof pronunciationResultSchema>;

/** Writing/reading/listening feedback payload. */
export const writingFeedbackSchema = z.object({
  observations: z.array(feedbackObservationSchema),
  strengths: z.array(z.string()),
  next_action: z.string(),
  limitations: z.string(),
  scores: z.array(practiceScoreSchema),
});
export type WritingFeedback = z.infer<typeof writingFeedbackSchema>;

/** Speaking adds transcript + pronunciation verdict + top-level retry_prompt. */
export const speakingFeedbackSchema = writingFeedbackSchema.extend({
  transcript: z.string(),
  transcript_confidence: z.number().min(0).max(1).optional(),
  pronunciation: pronunciationResultSchema,
  retry_prompt: z.string(),
});
export type SpeakingFeedback = z.infer<typeof speakingFeedbackSchema>;

/**
 * feedback_versions row as serialized by NextResponse.json — camelCase
 * drizzle columns (nextAction, modelRef, ...). This is the `feedback` value
 * inside createSubmission / retryAssessment responses.
 */
export const feedbackVersionSchema = z.object({
  id: uuidSchema,
  assessmentId: uuidSchema,
  learnerId: uuidSchema,
  submissionId: uuidSchema,
  runVersion: z.number().int(),
  // JSONB: rubric + pronunciation snapshot at evaluation time — shape is
  // schema-versioned by content, not locked at the API layer.
  rubricSnapshot: z.unknown().nullable(),
  modelRef: z.string().nullable(),
  observations: z.array(feedbackObservationSchema).nullable(),
  strengths: z.array(z.string()).nullable(),
  nextAction: z.string().nullable(),
  limitations: z.string().nullable(),
  scores: z.array(practiceScoreSchema).nullable(),
  reviewState: z.string().nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type FeedbackVersion = z.infer<typeof feedbackVersionSchema>;

/* ── Submissions ── */

export const modalitySchema = z.enum(["text", "audio"]);
export type Modality = z.infer<typeof modalitySchema>;

export const assessmentStatusSchema = z.enum([
  "queued",
  "processing",
  "needs_input",
  "feedback_ready",
  "failed",
]);
export type AssessmentStatus = z.infer<typeof assessmentStatusSchema>;

/**
 * POST /api/v1/sessions/[id]/submissions — accepts both `mediaId` and the
 * legacy `media_id` (clients send either; service resolves `mediaId ?? media_id`).
 * `assisted` must NOT be sent by clients — derived server-side from session_events.
 */
export const createSubmissionRequestSchema = z.object({
  body: z
    .string()
    .max(20000, "Nội dung bài nộp quá dài (tối đa 20.000 ký tự)")
    .optional(),
  parentId: uuidSchema.optional(),
  mediaId: uuidSchema.optional(),
  media_id: uuidSchema.optional(),
});
export type CreateSubmissionRequest = z.infer<typeof createSubmissionRequestSchema>;

export const createSubmissionResponseSchema = z.object({
  submissionId: uuidSchema,
  assessmentId: uuidSchema,
  status: assessmentStatusSchema,
  revision: z.number().int(),
  assisted: z.boolean(),
  /** null when evaluation failed — assessment stays "failed", submission kept. */
  feedback: feedbackVersionSchema.nullable(),
});
export type CreateSubmissionResponse = z.infer<typeof createSubmissionResponseSchema>;

export const submissionSchema = z.object({
  id: uuidSchema,
  sessionId: uuidSchema,
  learnerId: uuidSchema,
  revision: z.number().int(),
  parentId: uuidSchema.nullable(),
  modality: modalitySchema,
  body: z.string().nullable(),
  confirmedTranscript: z.string().nullable(),
  mediaId: uuidSchema.nullable(),
  assisted: z.boolean(),
  submittedAt: isoDateTimeSchema,
  deletedAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type Submission = z.infer<typeof submissionSchema>;

/** GET /api/v1/submissions list item — joins activity + assessment status. */
export const submissionListItemSchema = z.object({
  id: uuidSchema,
  sessionId: uuidSchema,
  revision: z.number().int(),
  modality: modalitySchema,
  assisted: z.boolean(),
  submittedAt: isoDateTimeSchema,
  activityId: z.string(),
  activityTitle: z.string(),
  activityMode: z.string(),
  activitySlot: z.string().nullable(),
  assessmentStatus: z.string(),
});
export type SubmissionListItem = z.infer<typeof submissionListItemSchema>;

export const submissionListResponseSchema = z.object({
  submissions: z.array(submissionListItemSchema),
});
export type SubmissionListResponse = z.infer<typeof submissionListResponseSchema>;

/**
 * PATCH /api/v1/submissions/[id] — append-only invariant: only
 * confirmed_transcript is mutable (learner edits their own transcript once).
 */
export const updateSubmissionRequestSchema = z.object({
  confirmed_transcript: z.string().min(1, "confirmed_transcript không được rỗng"),
});
export type UpdateSubmissionRequest = z.infer<typeof updateSubmissionRequestSchema>;

export const updateSubmissionResponseSchema = z.object({
  success: z.literal(true),
  submission: submissionSchema,
});
export const deleteSubmissionResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

/* ── Feedback review + retry ── */

/** POST /api/v1/feedback/[id]/flag — all fields optional. */
export const flagFeedbackRequestSchema = z.object({
  observationIndex: z.number().int().min(0).optional(),
  reason: z.string().optional(),
});
export type FlagFeedbackRequest = z.infer<typeof flagFeedbackRequestSchema>;

export const feedbackReviewResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  reviewState: z.string(),
});

/** POST /api/v1/assessments/[id]/retry. */
export const retryAssessmentResponseSchema = z.object({
  success: z.literal(true),
  feedback: feedbackVersionSchema,
});
