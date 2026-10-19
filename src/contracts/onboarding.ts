/**
 * Contracts cho /api/v1/onboarding — hồ sơ học tập (goals + preferences JSONB).
 */
import { z } from "zod";

/** Tự đánh giá 4 kỹ năng, thang 1–5. */
export const selfAssessmentSchema = z.object({
  writing: z.number().min(1).max(5).default(3),
  reading: z.number().min(1).max(5).default(3),
  speaking: z.number().min(1).max(5).default(3),
  listening: z.number().min(1).max(5).default(3),
});
export type SelfAssessment = z.infer<typeof selfAssessmentSchema>;

/** Body POST /api/v1/onboarding (giữ nguyên defaults của schema route cũ). */
export const onboardingPayloadSchema = z.object({
  displayName: z.string().optional(),
  priorities: z.array(z.string()).default([]),
  selfAssessment: selfAssessmentSchema.default({
    writing: 3,
    reading: 3,
    speaking: 3,
    listening: 3,
  }),
  workContext: z.string().default(""),
  ieltsVariant: z.enum(["academic", "general", "none"]).nullable().optional(),
  currentBook: z.string().optional(),
  preferredStudyTime: z.string().optional(),
  targetMinutesDefault: z.number().min(15).max(120).default(30),
});
export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;

/** Shape trả về của getLearnerOnboardingProfile — client đọc để điền form. */
export const onboardingProfileSchema = z.object({
  displayName: z.string(),
  priorities: z.array(z.string()),
  selfAssessment: z.object({
    writing: z.number(),
    reading: z.number(),
    speaking: z.number(),
    listening: z.number(),
  }),
  workContext: z.string(),
  ieltsVariant: z.enum(["academic", "general", "none"]).nullable(),
  currentBook: z.string(),
  preferredStudyTime: z.string(),
  targetMinutesDefault: z.number(),
  baselineStatus: z.string(),
});
export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;

export const onboardingGetResponseSchema = z.object({
  profile: onboardingProfileSchema.nullable(),
});

/** POST trả về learner row đầy đủ — client chỉ cần success nên lỏng phần còn lại. */
export const onboardingPostResponseSchema = z.looseObject({
  success: z.literal(true),
});
