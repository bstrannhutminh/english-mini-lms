/**
 * Admin dashboard + Drive-sync contracts — /api/v1/admin/dashboard and
 * /api/v1/admin/content/sync-drive. Split from admin-content.ts to keep
 * files under the 250-line budget.
 */
import { z } from "zod";
import { isoDateTimeSchema, uuidSchema } from "./common";

/* ── Drive sync ── */

export const syncDriveRequestSchema = z.object({
  dryRun: z.boolean().optional(),
});
export type SyncDriveRequest = z.infer<typeof syncDriveRequestSchema>;

export const syncConflictSchema = z.object({
  id: z.string(),
  kind: z.string(),
  reason: z.string(),
});
export const syncErrorSchema = z.object({
  file: z.string().optional(),
  id: z.string().optional(),
  message: z.string(),
});
export const syncDriveResultSchema = z.object({
  added: z.array(z.string()),
  updated: z.array(z.string()),
  skipped: z.array(z.string()),
  conflicts: z.array(syncConflictSchema),
  errors: z.array(syncErrorSchema),
  dryRun: z.boolean(),
});
export type SyncDriveResult = z.infer<typeof syncDriveResultSchema>;

/* ── Admin dashboard ── */

export const adminActivityItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  mode: z.string(),
  durationMinutes: z.number().int().nullable(),
  difficulty: z.string().nullable(),
  reviewState: z.string(),
  topic: z.string().nullable(),
  updatedAt: isoDateTimeSchema,
});
export const adminFailedAssessmentItemSchema = z.object({
  id: uuidSchema,
  submissionId: uuidSchema,
  learnerId: uuidSchema,
  learnerName: z.string().nullable(),
  activityTitle: z.string(),
  activityMode: z.string(),
  runVersion: z.number().int(),
  status: z.string(),
  createdAt: isoDateTimeSchema,
  submissionBodySnippet: z.string().nullable(),
});
export const adminFlaggedFeedbackItemSchema = z.object({
  id: uuidSchema,
  submissionId: uuidSchema,
  learnerId: uuidSchema,
  learnerName: z.string().nullable(),
  activityTitle: z.string(),
  activityMode: z.string(),
  reviewState: z.string(),
  createdAt: isoDateTimeSchema,
  // JSONB observations — flagged list only renders snippets/flags.
  observations: z.unknown(),
  submissionBodySnippet: z.string().nullable(),
});
export const monthlyUsageSummarySchema = z.object({
  month: z.string(),
  totalRequests: z.number().int(),
  totalInputTokens: z.number().int(),
  totalOutputTokens: z.number().int(),
  totalEstimatedCostUsd: z.number(),
  actionBreakdown: z.array(
    z.object({
      action: z.string(),
      count: z.number().int(),
      inputTokens: z.number().int(),
      outputTokens: z.number().int(),
      estimatedCostUsd: z.number(),
    })
  ),
});
export const adminDashboardDataSchema = z.object({
  activities: z.array(adminActivityItemSchema),
  failedAssessments: z.array(adminFailedAssessmentItemSchema),
  flaggedFeedback: z.array(adminFlaggedFeedbackItemSchema),
  usage: monthlyUsageSummarySchema,
});
export type AdminDashboardDataContract = z.infer<typeof adminDashboardDataSchema>;
