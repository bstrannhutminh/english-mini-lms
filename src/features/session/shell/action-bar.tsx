"use client";

import { Icon } from "@/components/ui";

/**
 * Thanh hành động dính đáy trong Focus Mode (mọi viewport):
 * Lưu nháp + Nộp bài với màu chủ đạo Teal, không bị che bởi bottom nav,
 * và không đè lên nội dung nhờ padding đáy của SessionShell.
 */
export function ActionBar({
  canSubmit,
  submitDisabledReason,
  isSubmitting,
  isSaving,
  submitError,
  onSaveDraft,
  onSubmit,
  submitLabel = "Nộp bài & nhận nhận xét",
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
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md shadow-[0_-4px_16px_rgba(15,23,42,0.04)]">
      <div className="mx-auto w-full max-w-[1200px]">
        {submitError && (
          <div
            role="alert"
            className="mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-700"
          >
            <Icon name="alert-triangle" className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        {!canSubmit && submitDisabledReason && (
          <p className="mb-2 text-center text-xs text-text-muted">
            {submitDisabledReason}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || isSubmitting}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 text-sm font-semibold text-text-secondary transition hover:bg-slate-200/70 hover:text-text disabled:opacity-60 sm:px-5"
          >
            <Icon name="save" className="h-4 w-4" />
            <span>{isSaving ? "Đang lưu..." : "Lưu nháp"}</span>
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Icon name="send" className="h-4 w-4" />
            <span>{isSubmitting ? "Đang gửi bài..." : submitLabel}</span>
          </button>
        </div>
        <p className="mt-1.5 hidden text-center text-[11px] text-text-muted lg:block">
          Phím tắt: Ctrl/⌘+S lưu nháp · Ctrl/⌘+Enter nộp bài
        </p>
      </div>
    </div>
  );
}
