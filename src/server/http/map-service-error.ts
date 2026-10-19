/**
 * mapServiceError() — convert any thrown error into a JSON response using
 * the unified error envelope. Handles:
 *  - ApiRouteError (route helpers)
 *  - service errors carrying `statusCode` (learning/vocabulary/media)
 *  - admin ContentError (`status` + FieldError[] details)
 *  - zod ZodError → 422 with per-field messages
 *  - missing-env / unreachable-DB errors → 503
 *  - anything else → 500 (message NOT leaked to client)
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { apiError } from "./api-error";
import { ApiRouteError } from "./errors";

/** HTTP status → default machine-readable code. */
const CODE_BY_STATUS: Record<number, string> = {
  400: "invalid_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  405: "method_not_allowed",
  409: "conflict",
  413: "payload_too_large",
  415: "unsupported_media_type",
  422: "validation_failed",
  429: "rate_limited",
  503: "service_unavailable",
};

function codeForStatus(status: number): string {
  return CODE_BY_STATUS[status] ?? "internal_error";
}

/** Convert admin FieldError[] details ({field,message}) into a fields map. */
function detailsToFields(
  details: Array<{ field: string; message: string }> | undefined
): Record<string, string> | undefined {
  if (!details || details.length === 0) return undefined;
  const fields: Record<string, string> = {};
  for (const d of details) fields[d.field] = d.message;
  return fields;
}

function zodIssuesToFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    if (!fields[path]) fields[path] = issue.message;
  }
  return fields;
}

/** Errors that mean the backing service is unavailable, not a client bug. */
function isInfraError(error: Error): boolean {
  if (error.name === "EnvError") return true; // src/lib/env.ts
  const msg = error.message;
  return (
    /DATABASE_URL|POSTGRES_URL|credentials are not set/i.test(msg) ||
    /ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND/.test(msg) ||
    /getaddrinfo|connect timeout|Connection terminated/i.test(msg)
  );
}

export function mapServiceError(error: unknown): NextResponse {
  if (error instanceof ApiRouteError) {
    return apiError(error.code, error.message, error.status, {
      fields: error.fields,
      extra: error.extra,
    });
  }

  if (error instanceof ZodError) {
    return apiError("validation_failed", "Dữ liệu không hợp lệ.", 422, {
      fields: zodIssuesToFields(error),
    });
  }

  if (error instanceof Error) {
    // Services throw errors carrying `status` (ContentError) or `statusCode`
    // (learning ValidationError / ConflictError / media MediaValidationError).
    const withStatus = error as Error & {
      status?: number;
      statusCode?: number;
      details?: Array<{ field: string; message: string }>;
      existingSessionId?: string;
    };
    const status =
      typeof withStatus.status === "number"
        ? withStatus.status
        : typeof withStatus.statusCode === "number"
          ? withStatus.statusCode
          : undefined;

    if (status && status >= 400 && status < 600) {
      const extra: Record<string, unknown> = {};
      if (withStatus.existingSessionId) {
        extra.sessionId = withStatus.existingSessionId;
      }
      return apiError(codeForStatus(status), error.message, status, {
        fields: detailsToFields(withStatus.details),
        extra: Object.keys(extra).length > 0 ? extra : undefined,
      });
    }

    if (isInfraError(error)) {
      console.error("[api] service unavailable:", error.message);
      return apiError(
        "service_unavailable",
        "Hệ thống đang bảo trì hoặc chưa cấu hình đầy đủ. Vui lòng thử lại sau.",
        503
      );
    }
  }

  console.error("[api] unhandled error:", error);
  return apiError(
    "internal_error",
    "Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại.",
    500
  );
}
