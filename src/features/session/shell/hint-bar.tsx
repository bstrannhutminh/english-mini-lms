"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

/**
 * Thang gợi ý dùng chung: bấm "Xin gợi ý" → shell ghi session_events
 * kind=hint (server sẽ tính assisted) → mở nội dung gợi ý của plugin.
 */
export function HintBar({
  label,
  shown,
  loading,
  error,
  onRequest,
  children,
}: {
  label: string;
  shown: boolean;
  loading: boolean;
  error?: string | null;
  onRequest: () => void;
  children: ReactNode;
}) {
  return (
    <aside className="mb-6">
      {!shown ? (
        <button
          type="button"
          onClick={onRequest}
          disabled={loading}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-base font-medium text-primary-dark transition hover:bg-primary-soft disabled:opacity-60"
        >
          <Icon name="lightbulb" className="h-4 w-4 text-amber-600" />
          <span>{loading ? "Đang ghi nhận yêu cầu…" : error ? "Thử mở gợi ý lại" : label}</span>
        </button>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-base leading-relaxed text-amber-950">
          <div className="mb-2 flex items-center gap-2 text-base font-semibold text-amber-900">
            <Icon name="lightbulb" className="h-4 w-4" />
            <span>Gợi ý hỗ trợ</span>
          </div>
          {children}
          <p className="mt-3 text-base text-amber-900">
            * Bài làm này sẽ được gắn nhãn &ldquo;Có hỗ trợ&rdquo; khi nộp để
            tách riêng với bài tự làm độc lập.
          </p>
        </div>
      )}
      {error && <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800">{error}</p>}
    </aside>
  );
}
