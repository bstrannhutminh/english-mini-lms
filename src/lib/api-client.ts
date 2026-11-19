/**
 * apiFetch(input, init, schema) — typed fetch for client components.
 *
 * - Successful responses are validated against the supplied zod contract.
 * - Errors throw ApiClientError carrying {code, status, fields, sessionId?}.
 * - Understands BOTH the new envelope `{ error: { code, message, fields } }`
 *   and legacy shapes `{ error: "...", details?: [{field,message}] }` so
 *   clients can adopt contracts before every route is migrated.
 */
import { z } from "zod";

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string>;
  /** Present on 409 session-conflict responses — continue that session. */
  sessionId?: string;

  constructor(
    code: string,
    message: string,
    status: number,
    options?: { fields?: Record<string, string>; sessionId?: string }
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.fields = options?.fields;
    this.sessionId = options?.sessionId;
  }
}

const DEFAULT_CODE_BY_STATUS: Record<number, string> = {
  400: "invalid_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  413: "payload_too_large",
  415: "unsupported_media_type",
  422: "validation_failed",
  429: "rate_limited",
  500: "internal_error",
  503: "service_unavailable",
};

const FALLBACK_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại.";

/** Normalise legacy `details: [{field,message}]` into a fields map. */
function detailsToFields(
  details: unknown
): Record<string, string> | undefined {
  if (!Array.isArray(details) || details.length === 0) return undefined;
  const fields: Record<string, string> = {};
  for (const d of details) {
    if (
      d &&
      typeof d === "object" &&
      typeof (d as { field?: unknown }).field === "string" &&
      typeof (d as { message?: unknown }).message === "string"
    ) {
      fields[(d as { field: string }).field] = (d as { message: string }).message;
    }
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

/** Parse an error response body into an ApiClientError (new + legacy shapes). */
function toApiClientError(status: number, body: unknown): ApiClientError {
  const record = (body ?? {}) as Record<string, unknown>;
  const sessionId =
    typeof record.sessionId === "string" ? record.sessionId : undefined;

  // New envelope: { error: { code, message, fields? } }
  const nested = record.error;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const e = nested as Record<string, unknown>;
    return new ApiClientError(
      typeof e.code === "string" ? e.code : DEFAULT_CODE_BY_STATUS[status] ?? "internal_error",
      typeof e.message === "string" ? e.message : FALLBACK_MESSAGE,
      status,
      {
        fields:
          e.fields && typeof e.fields === "object"
            ? (e.fields as Record<string, string>)
            : undefined,
        sessionId,
      }
    );
  }

  // Legacy: { error: "...", details?: [...], sessionId? }
  if (typeof nested === "string") {
    return new ApiClientError(
      DEFAULT_CODE_BY_STATUS[status] ?? "internal_error",
      nested,
      status,
      { fields: detailsToFields(record.details), sessionId }
    );
  }

  return new ApiClientError(
    DEFAULT_CODE_BY_STATUS[status] ?? "internal_error",
    FALLBACK_MESSAGE,
    status,
    { sessionId }
  );
}

/**
 * Fetch `input`, validate the success payload with `schema`, and return the
 * parsed data. Throws ApiClientError on network failure, non-2xx responses,
 * and contract mismatches.
 */
export async function apiFetch<S extends z.ZodTypeAny>(
  input: string,
  init: RequestInit | undefined,
  schema: S
): Promise<z.infer<S>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new ApiClientError(
      "network_error",
      "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
      0
    );
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new ApiClientError(
          DEFAULT_CODE_BY_STATUS[res.status] ?? "internal_error",
          `Máy chủ trả về dữ liệu không đọc được (HTTP ${res.status}).`,
          res.status
        );
      }
      throw new ApiClientError(
        "invalid_response",
        "Máy chủ trả về dữ liệu không đúng định dạng.",
        res.status
      );
    }
  }

  if (!res.ok) {
    throw toApiClientError(res.status, body);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("[api-client] contract mismatch:", parsed.error.issues);
    throw new ApiClientError(
      "invalid_response",
      "Máy chủ trả về dữ liệu không đúng định dạng mong đợi.",
      res.status
    );
  }
  return parsed.data;
}
