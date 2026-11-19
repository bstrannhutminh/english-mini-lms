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
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
        >
          <Icon name="lightbulb" className="h-4 w-4 text-amber-600" />
          <span>{loading ? "Đang mở gợi ý..." : label}</span>
        </button>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-950">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <Icon name="lightbulb" className="h-4 w-4" />
            <span>Gợi ý hỗ trợ</span>
          </div>
          {children}
          <p className="mt-2.5 text-xs italic text-amber-800/80">
            * Bài làm này sẽ được gắn nhãn &ldquo;Có hỗ trợ&rdquo; khi nộp để
            tách riêng với bài tự làm độc lập.
          </p>
        </div>
      )}
    </div>
  );
}
