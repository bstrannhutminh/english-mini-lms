/**
 * Typed admin API client — apiFetch + zod contracts (src/contracts/*).
 * Mọi lỗi throw ApiClientError { code, status, fields? } — caller hiển thị
 * message + field errors bằng tiếng Việt.
 */
import { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import {
  adminActivityListResponseSchema,
  adminActivityResponseSchema,
  adminSourceListResponseSchema,
  adminSourceResponseSchema,
  adminSegmentListResponseSchema,
  adminSegmentResponseSchema,
} from "@/contracts/admin-content";
import {
  adminDashboardDataSchema,
  syncDriveResultSchema,
} from "@/contracts/admin-dashboard";
import { createSessionResponseSchema } from "@/contracts/session";

const JSON_HEADERS = { "Content-Type": "application/json" };

const GET_INIT = { method: "GET" } satisfies RequestInit;
const post = (body?: unknown) => ({
  method: "POST" as const,
  headers: body === undefined ? undefined : JSON_HEADERS,
  body: body === undefined ? undefined : JSON.stringify(body),
});
const patch = (body: unknown) => ({
  method: "PATCH" as const,
  headers: JSON_HEADERS,
  body: JSON.stringify(body),
});

/** Response phụ (retry/resolve) — server trả object bất kỳ, chỉ cần res.ok. */
const okResponseSchema = z.looseObject({});

/* ── Dashboard ── */
export const fetchAdminDashboard = () =>
  apiFetch("/api/v1/admin/dashboard", GET_INIT, adminDashboardDataSchema);

/* ── Activities ── */
export const listActivities = () =>
  apiFetch(
    "/api/v1/admin/content/activities?state=all",
    GET_INIT,
    adminActivityListResponseSchema
  );
export const createActivity = (body: unknown) =>
  apiFetch("/api/v1/admin/content/activities", post(body), adminActivityResponseSchema);
export const updateActivity = (id: string, body: unknown) =>
  apiFetch(
    `/api/v1/admin/content/activities/${id}`,
    patch(body),
    adminActivityResponseSchema
  );

/* ── Sources ── */
export const listSources = () =>
  apiFetch(
    "/api/v1/admin/content/sources?state=all",
    GET_INIT,
    adminSourceListResponseSchema
  );
export const createSource = (body: unknown) =>
  apiFetch("/api/v1/admin/content/sources", post(body), adminSourceResponseSchema);
export const updateSource = (id: string, body: unknown) =>
  apiFetch(
    `/api/v1/admin/content/sources/${id}`,
    patch(body),
    adminSourceResponseSchema
  );

/* ── Segments ── */
export const listSegments = () =>
  apiFetch("/api/v1/admin/content/segments", GET_INIT, adminSegmentListResponseSchema);
export const createSegment = (body: unknown) =>
  apiFetch("/api/v1/admin/content/segments", post(body), adminSegmentResponseSchema);
export const updateSegment = (id: string, body: unknown) =>
  apiFetch(
    `/api/v1/admin/content/segments/${id}`,
    patch(body),
    adminSegmentResponseSchema
  );

/* ── Drive sync ── */
export const syncDrive = (dryRun: boolean) =>
  apiFetch(
    "/api/v1/admin/content/sync-drive",
    post({ dryRun }),
    syncDriveResultSchema
  );

/* ── Hành động ngoài /admin (giữ nguyên endpoint hiện có) ── */
export const retryAssessment = (assessmentId: string) =>
  apiFetch(`/api/v1/assessments/${assessmentId}/retry`, post(), okResponseSchema);
export const resolveFeedback = (feedbackId: string) =>
  apiFetch(`/api/v1/feedback/${feedbackId}/resolve`, post(), okResponseSchema);
export const startSession = (activityId: string, targetMinutes: 30 | 45 = 30) =>
  apiFetch(
    "/api/v1/sessions",
    post({ activityId, targetMinutes }),
    createSessionResponseSchema
  );
