/**
 * Shared API contract primitives — single source of truth for every
 * /api/v1 request/response envelope. See docs/plan/data-and-tools-contract.md.
 */
import { z } from "zod";

/** Per-field validation messages, keyed by field name or dotted path. */
export const apiErrorFieldsSchema = z.record(z.string(), z.string());
export type ApiErrorFields = z.infer<typeof apiErrorFieldsSchema>;

/**
 * Unified error envelope for all new API responses:
 * `{ error: { code, message, fields? } }`.
 * `message` is always a user-facing Vietnamese string.
 */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: apiErrorFieldsSchema.optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/**
 * Legacy error shape still emitted by pre-refactor routes:
 * `{ error: "...", details?: [{field,message}], sessionId? }`.
 * Loose object — routes add ad-hoc extras (e.g. `sessionId` on 409).
 */
export const fieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});
export type FieldError = z.infer<typeof fieldErrorSchema>;

export const legacyErrorBodySchema = z.looseObject({
  error: z.string(),
  details: z.array(fieldErrorSchema).optional(),
});
export type LegacyErrorBody = z.infer<typeof legacyErrorBodySchema>;

/** Offset pagination query params (all optional, coerced). */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Generic paginated list envelope for list endpoints. */
export function paginatedResponseSchema<S extends z.ZodTypeAny>(itemSchema: S) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
  });
}

/* ── Shared scalar primitives ── */

export const uuidSchema = z.string().uuid();

/** ISO-8601 timestamp as serialized by NextResponse.json on Drizzle rows. */
export const isoDateTimeSchema = z.string();

/** 4 standard modes + 4 IELTS variants (must map to base skill via modeSkill). */
export const activityModeSchema = z.enum([
  "writing",
  "reading",
  "speaking",
  "listening",
  "ielts-writing",
  "ielts-reading",
  "ielts-speaking",
  "ielts-listening",
]);
export type ActivityMode = z.infer<typeof activityModeSchema>;
