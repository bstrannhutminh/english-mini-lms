"use client";

import type { ReactNode } from "react";

/**
 * Thang gợi ý dùng chung: bấm "Xin gợi ý" → shell ghi session_events
 * kind=hint (server sẽ tính assisted) → mở nội dung gợi ý của plugin.
 */
export function HintBar({
  label,
  shown,
  loading,
  onRequest,
  children,
}: {
  label: string;
  shown: boolean;
  loading: boolean;
  onRequest: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      {!shown ? (
        <button
          type="button"
          onClick={onRequest}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
        >
          💡 {loading ? "Đang mở gợi ý..." : label}
        </button>
      ) : (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs leading-relaxed text-yellow-900">
          {children}
          <div className="mt-2 text-[11px] italic text-amber-700">
            * Bài làm này sẽ được gắn nhãn &ldquo;Có hỗ trợ&rdquo; khi nộp.
          </div>
        </div>
      )}
    </div>
  );
}
