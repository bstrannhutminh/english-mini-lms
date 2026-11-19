/**
 * Vocabulary Vault contracts — /api/v1/vocabulary*.
 * Request bodies use snake_case (existing client contract); DB-row
 * responses serialize camelCase drizzle columns.
 */
import { z } from "zod";
import { isoDateTimeSchema, uuidSchema } from "./common";
import { modalitySchema } from "./submission";

/** vocabulary_vault row (camelCase, as serialized from drizzle). */
export const vocabularyItemSchema = z.object({
  id: uuidSchema,
  learnerId: uuidSchema,
  phrase: z.string(),
  ipa: z.string().nullable(),
  contextMeaning: z.string().nullable(),
  originalSentence: z.string().nullable(),
  sourceType: z.string().nullable(),
  sourceRef: z.string().nullable(),
  myAttempt: z.string().nullable(),
  masteryLevel: z.number().int(),
  dueAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>;

/** Subset returned by review/flashcard lists + generated challengePrompt. */
export const reviewVocabItemSchema = z.object({
  id: uuidSchema,
  phrase: z.string(),
  ipa: z.string().nullable(),
  contextMeaning: z.string().nullable(),
  originalSentence: z.string().nullable(),
  sourceRef: z.string().nullable(),
  sourceType: z.string().nullable().optional(),
  myAttempt: z.string().nullable(),
  masteryLevel: z.number().int(),
  dueAt: isoDateTimeSchema,
  challengePrompt: z.string().optional(),
});
export type ReviewVocabItem = z.infer<typeof reviewVocabItemSchema>;

/* ── CRUD ── */

/** POST /api/v1/vocabulary — snake_case request fields. */
export const createVocabularyRequestSchema = z.object({
  phrase: z.string().min(1, "phrase không được rỗng"),
  ipa: z.string().optional(),
  context_meaning: z.string().optional(),
  original_sentence: z.string().min(1, "original_sentence không được rỗng"),
  source_ref: z.string().optional(),
  source_type: z.string().optional(),
  my_attempt: z.string().optional(),
});
export type CreateVocabularyRequest = z.infer<typeof createVocabularyRequestSchema>;

export const createVocabularyResponseSchema = z.object({
  vocabulary: vocabularyItemSchema,
});
export const updateVocabularyResponseSchema = createVocabularyResponseSchema;

export const vocabularyListResponseSchema = z.object({
  items: z.array(vocabularyItemSchema),
});
export type VocabularyListResponse = z.infer<typeof vocabularyListResponseSchema>;

/** PATCH /api/v1/vocabulary/[id] — snake_case, all optional. */
export const updateVocabularyRequestSchema = z.object({
  my_attempt: z.string().optional(),
  // Thang mastery chốt 0–4 (hiển thị "x/5") — quyết định D-2.
  mastery_level: z.number().int().min(0).max(4).optional(),
  context_meaning: z.string().optional(),
});
export type UpdateVocabularyRequest = z.infer<typeof updateVocabularyRequestSchema>;

/* ── Quick capture ── */

/** POST /api/v1/vocabulary/quick-capture — snake_case in and out (Gemini). */
export const quickCaptureRequestSchema = z.object({
  selected_text: z.string().min(1, "selected_text không được rỗng"),
  surrounding_sentence: z.string().optional().default(""),
  source_ref: z.string().optional(),
});
export type QuickCaptureRequest = z.infer<typeof quickCaptureRequestSchema>;

export const quickCaptureResponseSchema = z.object({
  phrase: z.string(),
  ipa: z.string(),
  context_meaning: z.string(),
  example_sentence: z.string(),
});
export type QuickCaptureResponse = z.infer<typeof quickCaptureResponseSchema>;

/* ── Review ── */

/** GET /api/v1/vocabulary/review — due items (+ optional challengePrompt). */
export const reviewListResponseSchema = z.object({
  items: z.array(reviewVocabItemSchema),
  count: z.number().int(),
});
export type ReviewListResponse = z.infer<typeof reviewListResponseSchema>;

/** POST /api/v1/vocabulary/review — micro-challenge submission (snake_case). */
export const submitReviewRequestSchema = z.object({
  vocab_id: uuidSchema,
  scenario: z.string().min(1),
  user_response: z.string().min(1),
  modality: modalitySchema.optional().default("text"),
});
export type SubmitReviewRequest = z.infer<typeof submitReviewRequestSchema>;

export const vocabularyReviewSchema = z.object({
  id: uuidSchema,
  clientReviewId: uuidSchema.nullable(),
  vocabularyId: uuidSchema,
  learnerId: uuidSchema,
  reviewChannel: z.string().nullable(),
  promptScenario: z.string().nullable(),
  userResponse: z.string().nullable(),
  responseModality: modalitySchema.nullable(),
  aiAssessment: z.string().nullable(),
  resultStatus: z.string().nullable(),
  nextDueAt: isoDateTimeSchema.nullable(),
  reviewedAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type VocabularyReview = z.infer<typeof vocabularyReviewSchema>;

/** Micro-challenge AI evaluation (camelCase — client reads resultStatus). */
export const vocabEvaluationSchema = z.object({
  resultStatus: z.enum(["correct", "incorrect", "partial"]),
  aiAssessment: z.string(),
  feedbackNotes: z.string(),
  exampleCorrection: z.string().optional(),
});
export type VocabEvaluation = z.infer<typeof vocabEvaluationSchema>;

export const submitReviewResponseSchema = z.object({
  review: vocabularyReviewSchema,
  vocabulary: vocabularyItemSchema,
  evaluation: vocabEvaluationSchema,
  nextDueAt: isoDateTimeSchema,
  intervalDays: z.number().int(),
  masteryLevel: z.number().int(),
});
export type SubmitReviewResponse = z.infer<typeof submitReviewResponseSchema>;

/* ── Quick flashcard review (mode="quick") ── */

export const quickReviewItemSchema = z.object({
  vocab_id: uuidSchema,
  result: z.enum(["know", "dont_know"]),
  clientReviewId: uuidSchema.optional(),
});
export type QuickReviewItem = z.infer<typeof quickReviewItemSchema>;

/** Accepts either a single {vocab_id,result} or a batch `reviews` array. */
export const submitQuickReviewRequestSchema = z.object({
  mode: z.literal("quick"),
  vocab_id: uuidSchema.optional(),
  result: z.enum(["know", "dont_know"]).optional(),
  clientReviewId: uuidSchema.optional(),
  reviews: z.array(quickReviewItemSchema).max(200).optional(),
});
export type SubmitQuickReviewRequest = z.infer<typeof submitQuickReviewRequestSchema>;

export const quickReviewResultSchema = z.object({
  vocabId: uuidSchema,
  phrase: z.string(),
  result: z.enum(["know", "dont_know"]),
  nextMastery: z.number().int(),
  nextDueAt: isoDateTimeSchema,
  intervalDays: z.number().int(),
  idempotentDuplicate: z.boolean().optional(),
});
export type QuickReviewResult = z.infer<typeof quickReviewResultSchema>;

export const submitQuickReviewResponseSchema = z.object({
  success: z.literal(true),
  processedCount: z.number().int(),
  results: z.array(quickReviewResultSchema),
});
export type SubmitQuickReviewResponse = z.infer<typeof submitQuickReviewResponseSchema>;

/**
 * POST /api/v1/vocabulary/review — một route nhận 2 dạng body:
 * quick-flashcard (có mode:"quick") hoặc micro-challenge (không có mode).
 * Union này để parseJson gom validation về một chỗ.
 */
export const submitReviewPostRequestSchema = z.union([
  submitQuickReviewRequestSchema,
  submitReviewRequestSchema,
]);
export type SubmitReviewPostRequest = z.infer<typeof submitReviewPostRequestSchema>;
