/**
 * Media contracts — audio uploads via Supabase Storage (media_objects table).
 * Upload and signed-url responses are snake_case (client contract since v1);
 * submission requests accept both mediaId and media_id (see submission.ts).
 * Limits: audio ≤5min/20MB — enforced server-side in media service.
 */
import { z } from "zod";
import { uuidSchema } from "./common";

/** media_status enum in src/db/schema.ts. */
export const mediaStatusSchema = z.enum(["pending", "ready", "failed"]);
export type MediaStatus = z.infer<typeof mediaStatusSchema>;

/** media_objects row (camelCase drizzle serialization). */
export const mediaObjectSchema = z.object({
  id: uuidSchema,
  learnerId: uuidSchema,
  storageKey: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nullable(),
  durationSeconds: z.number().int().nullable(),
  status: mediaStatusSchema,
  hash: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MediaObject = z.infer<typeof mediaObjectSchema>;

/** POST /api/v1/media (multipart/form-data) — snake_case by contract. */
export const uploadMediaResponseSchema = z.object({
  media_id: uuidSchema,
  status: mediaStatusSchema,
  storage_key: z.string(),
  size_bytes: z.number().int().nullable(),
});
export type UploadMediaResponse = z.infer<typeof uploadMediaResponseSchema>;

/** GET /api/v1/media/[id]/signed-url — short-lived, private bucket. */
export const mediaSignedUrlResponseSchema = z.object({
  media_id: uuidSchema,
  signed_url: z.string(),
  expires_in_seconds: z.number().int(),
});
export type MediaSignedUrlResponse = z.infer<typeof mediaSignedUrlResponseSchema>;
