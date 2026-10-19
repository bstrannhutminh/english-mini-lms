/**
 * apiError() — build a NextResponse with the unified error envelope
 * `{ error: { code, message, fields? } }` (contract: src/contracts/common.ts).
 */
import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/contracts/common";

export function apiError(
  code: string,
  message: string,
  status: number,
  options?: {
    fields?: Record<string, string>;
    /** Extra top-level keys merged into the body (e.g. `sessionId` on 409). */
    extra?: Record<string, unknown>;
  }
): NextResponse {
  const body: ApiErrorBody & Record<string, unknown> = {
    error: {
      code,
      message,
      ...(options?.fields ? { fields: options.fields } : {}),
    },
    ...(options?.extra ?? {}),
  };
  return NextResponse.json(body, { status });
}
