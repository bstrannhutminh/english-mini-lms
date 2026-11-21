"use client";

import { Icon } from "@/components/ui";

/** Banner cảnh báo mất mạng + nút thử lưu lại nháp ngay. */
export function OfflineBanner({
  isOnline,
  onRetrySave,
}: {
  isOnline: boolean;
  onRetrySave: () => void;
}) {
  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-900 lg:mb-4 lg:mt-0"
    >
      <span className="flex min-w-0 items-start gap-2">
        <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
        <span>
          <strong>Mất kết nối mạng.</strong> Bài nháp chưa lưu được — hệ thống sẽ
          tự thử lại khi có mạng.
        </span>
      </span>
      <button
        type="button"
        onClick={onRetrySave}
        className="pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-xl border border-amber-300 bg-surface px-3 text-base font-semibold text-amber-900"
      >
        Thử lại ngay
      </button>
    </div>
  );
}
