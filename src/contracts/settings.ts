/**
 * Contracts cho /api/v1/settings/** — dùng chung route ⇄ client.
 * Field names khớp payload hiện có (camelCase từ Drizzle).
 */
import { z } from "zod";
import { isoDateTimeSchema, uuidSchema } from "./common";

/* ── GET /api/v1/settings ── */

export const learnerProfileSchema = z.object({
  id: uuidSchema,
  displayName: z.string().nullable(),
  role: z.enum(["learner", "admin"]),
  /** JSONB tuỳ ý — client chỉ đọc remindEnabled/remindTime/tourCompleted. */
  preferences: z.record(z.string(), z.unknown()).nullable(),
  timezone: z.string().nullable(),
  createdAt: isoDateTimeSchema,
});
export type LearnerProfile = z.infer<typeof learnerProfileSchema>;

export const settingsSubmissionSchema = z.object({
  id: uuidSchema,
  revision: z.number().int(),
  createdAt: isoDateTimeSchema,
  mediaId: uuidSchema.nullable(),
  activityId: uuidSchema,
  activityTitle: z.string(),
  activityMode: z.string(),
});
export type SettingsSubmission = z.infer<typeof settingsSubmissionSchema>;

export const settingsResponseSchema = z.object({
  learner: learnerProfileSchema.nullable(),
  submissions: z.array(settingsSubmissionSchema),
});
export type SettingsResponse = z.infer<typeof settingsResponseSchema>;

/* ── PATCH /api/v1/settings/preferences ── */

/**
 * Khoá được phép PATCH. Chỉ khoá gửi lên mới đổi — server merge vào
 * preferences hiện có (xem server/settings/preferences.ts mergePreferences).
 */
export const preferencesPatchSchema = z.object({
  remindEnabled: z.boolean().optional(),
  remindTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ nhắc phải có dạng HH:mm")
    .optional(),
  /** true = đã xem/bỏ qua hướng dẫn; false = xoá cờ để xem lại hướng dẫn. */
  tourCompleted: z.boolean().optional(),
});
export type PreferencesPatch = z.infer<typeof preferencesPatchSchema>;

export const preferencesResponseSchema = z.object({
  success: z.literal(true),
  preferences: z.record(z.string(), z.unknown()),
});
export type PreferencesResponse = z.infer<typeof preferencesResponseSchema>;
