"use client";

/**
 * Shared form primitives for admin screens — ≥44px touch targets, ≥16px text.
 * ErrorList renders the unified API envelope fields ({code,message,fields}).
 */
import type { ReactNode } from "react";
import { ApiClientError } from "@/lib/api-client";
import type { FieldError } from "@/lib/content-constants";

export const inputCls =
  "w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500";
export const textareaCls = `${inputCls} font-mono text-sm leading-relaxed`;

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

/** Chuẩn hoá lỗi API → { message, fields } để ErrorList hiển thị. */
export function toErrorState(err: unknown): {
  message: string;
  fields: FieldError[];
} {
  if (err instanceof ApiClientError) {
    return {
      message: err.message,
      fields: Object.entries(err.fields ?? {}).map(([field, message]) => ({
        field,
        message,
      })),
    };
  }
  return {
    message: err instanceof Error ? err.message : "Đã có lỗi xảy ra.",
    fields: [],
  };
}

export function ErrorList({
  error,
  details,
}: {
  error: string | null;
  details: FieldError[];
}) {
  if (!error && details.length === 0) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 space-y-1"
    >
      {error && <p className="font-medium">{error}</p>}
      {details.length > 0 && (
        <ul className="list-disc pl-5 space-y-0.5">
          {details.map((d, i) => (
            <li key={i}>
              <code className="font-semibold">{d.field}</code>: {d.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
