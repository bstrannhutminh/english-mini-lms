"use client";

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
      className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <span>
        ⚠️ <strong>Mất kết nối mạng.</strong> Bài nháp chưa lưu được — hệ thống sẽ
        tự thử lại khi có mạng.
      </span>
      <button
        type="button"
        onClick={onRetrySave}
        className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800"
      >
        Thử lại ngay
      </button>
    </div>
  );
}
