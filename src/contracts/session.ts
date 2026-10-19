/**
 * Learning-session contracts — /api/v1/sessions*, drafts, events, shadowing.
 * Field names match what the learn/* views already send and read.
 */
import { z } from "zod";
import { uuidSchema } from "./common";
import { speakingFeedbackSchema } from "./submission";

/** Locked practice block: 30 or 45 minutes. */
export const targetMinutesSchema = z.union([z.literal(30), z.literal(45)]);
export type TargetMinutes = z.infer<typeof targetMinutesSchema>;

/* ── POST /api/v1/sessions ── */

export const createSessionRequestSchema = z.object({
  activityId: z.string().min(1, "Thiếu activityId"),
  targetMinutes: targetMinutesSchema.optional().default(30),
});
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const createSessionResponseSchema = z.object({
  sessionId: uuidSchema,
});
export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;

/** 409 — an in-flight session for this activity exists; client may continue it. */
export const sessionConflictResponseSchema = z.looseObject({
  error: z.string(),
  sessionId: uuidSchema,
});
export type SessionConflictResponse = z.infer<typeof sessionConflictResponseSchema>;

/* ── POST /api/v1/sessions/[id]/events ── */

/** `hint`/`reveal` are what `assisted` derives from — never trust the client. */
export const sessionEventKindSchema = z.enum([
  "hint",
  "reveal",
  "pause",
  "resume",
  "finish",
]);
export type SessionEventKind = z.infer<typeof sessionEventKindSchema>;

export const createSessionEventRequestSchema = z.object({
  kind: sessionEventKindSchema,
  // Kind-specific payload (e.g. { target: "listening_transcript" }) — free-form.
  payload: z.unknown().optional(),
});
export type CreateSessionEventRequest = z.infer<typeof createSessionEventRequestSchema>;

export const createSessionEventResponseSchema = z.object({
  success: z.literal(true),
  eventId: uuidSchema,
});

/* ── POST /api/v1/sessions/[id]/drafts ── */

export const saveDraftRequestSchema = z.object({
  content: z.string(),
  version: z.number().int().optional().default(1),
});
export type SaveDraftRequest = z.infer<typeof saveDraftRequestSchema>;

export const saveDraftResponseSchema = z.object({
  success: z.literal(true),
  draftId: uuidSchema,
  version: z.number().int(),
});

/* ── POST /api/v1/sessions/[id]/shadowing ──
 * snake_case `media_id` is the client contract (listening-session-view). */
export const shadowingRequestSchema = z.object({
  media_id: uuidSchema,
  sentence: z.string().min(1),
  startSeconds: z.number().optional(),
  endSeconds: z.number().optional(),
});
export type ShadowingRequest = z.infer<typeof shadowingRequestSchema>;

export const shadowingResponseSchema = z.object({
  success: z.literal(true),
  feedback: speakingFeedbackSchema,
});
export type ShadowingResponse = z.infer<typeof shadowingResponseSchema>;
