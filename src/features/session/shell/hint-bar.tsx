"use client";

import { useState, type ReactNode } from "react";
import { Badge, Icon } from "@/components/ui";

/**
 * Thang gợi ý dùng chung: bấm "Xin gợi ý" → shell ghi session_events
 * kind=hint (server sẽ tính assisted) → mở nội dung gợi ý của plugin.
 * Đóng = nút dạng viên thuốc kín đáo; mở = thẻ ghi chú tông hổ phách, có thể
 * thu gọn tại chỗ (chỉ là hiển thị — không ghi thêm event nào).
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
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className="mb-4 lg:mb-5">
      {!shown ? (
        <button
          type="button"
          onClick={onRequest}
          disabled={loading}
          className="pressable inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-base font-medium text-text-secondary hover:border-amber-300 hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="lightbulb" className="h-4 w-4 text-amber-600" />
          <span>{loading ? "Đang ghi nhận yêu cầu…" : error ? "Thử mở gợi ý lại" : label}</span>
        </button>
      ) : (
        <section aria-label="Gợi ý hỗ trợ" className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70">
          <button
            type="button"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left sm:px-5"
          >
            <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Icon name="lightbulb" className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-base font-semibold text-text">Gợi ý hỗ trợ</span>
            <Badge tone="warning">Có hỗ trợ</Badge>
            <Icon name="chevron-down" className={`h-4 w-4 text-text-muted transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
          <div className={collapsed ? "hidden" : "border-t border-amber-200/70 px-4 pb-4 pt-3 sm:px-5"}>
            <div className="max-w-[70ch] text-base leading-relaxed text-text">{children}</div>
            <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-text-secondary">
              <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <span>
                Bài làm này sẽ được gắn nhãn &ldquo;Có hỗ trợ&rdquo; khi nộp để
                tách riêng với bài tự làm độc lập.
              </span>
            </p>
          </div>
        </section>
      )}
      {error && <p role="alert" className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800">{error}</p>}
    </aside>
  );
}
