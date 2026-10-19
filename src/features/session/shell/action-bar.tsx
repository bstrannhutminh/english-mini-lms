"use client";

/**
 * Thanh hành động dính đáy (mọi viewport): Lưu nháp + Nộp bài.
 * Touch target ≥ 44px; lý do chưa-thể-nộp / lỗi nộp hiện phía trên nút.
 */
export function ActionBar({
  canSubmit,
  submitDisabledReason,
  isSubmitting,
  isSaving,
  submitError,
  onSaveDraft,
  onSubmit,
  submitLabel = "🚀 Nộp bài & nhận nhận xét",
}: {
  canSubmit: boolean;
  submitDisabledReason?: string;
  isSubmitting: boolean;
  isSaving: boolean;
  submitError: string | null;
  onSaveDraft: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto w-full max-w-[1200px]">
        {submitError && (
          <div
            role="alert"
            className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            ⚠️ {submitError}
          </div>
        )}
        {!canSubmit && submitDisabledReason && (
          <p className="mb-2 text-center text-xs text-slate-500">
            {submitDisabledReason}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || isSubmitting}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60 sm:px-5"
          >
            {isSaving ? "Đang lưu..." : "💾 Lưu nháp"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="min-h-[48px] flex-1 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang gửi bài..." : submitLabel}
          </button>
        </div>
        <p className="mt-1.5 hidden text-center text-[11px] text-slate-400 lg:block">
          ⌨️ Ctrl/⌘+S lưu nháp · Ctrl/⌘+Enter nộp bài
        </p>
      </div>
    </div>
  );
}
