"use client";

import { Icon } from "@/components/ui";
import { useActionBarSpace } from "./use-action-bar-space";

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
  submitLabel = "Nộp bài",
  onHeightChange,
}: {
  canSubmit: boolean;
  submitDisabledReason?: string;
  isSubmitting: boolean;
  isSaving: boolean;
  submitError: string | null;
  onSaveDraft: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  onHeightChange?: (height: number) => void;
}) {
  const { barRef, keyboardInset } = useActionBarSpace(onHeightChange);
  return (
    <div ref={barRef} style={{ bottom: keyboardInset }} className="fixed inset-x-0 z-20 border-t border-border bg-surface/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1200px]">
        {submitError && (
          <div
            role="alert"
            className="mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800"
          >
            <Icon name="alert-triangle" className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        {!canSubmit && submitDisabledReason && (
          <p className="mb-2 text-base text-text-secondary">
            {submitDisabledReason}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || isSubmitting}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-base font-medium text-text-secondary transition hover:bg-surface-muted disabled:opacity-60 sm:px-5"
          >
            <Icon name="save" className="h-4 w-4" />
            <span>{isSaving ? "Đang lưu..." : "Lưu nháp"}</span>
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-base font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Icon name="send" className="h-4 w-4" />
            <span>{isSubmitting ? "Đang gửi bài..." : submitLabel}</span>
          </button>
        </div>
        <p className="mt-2 hidden text-center text-base text-text-secondary lg:block">
          Phím tắt: Ctrl/⌘+S lưu nháp · Ctrl/⌘+Enter nộp bài
        </p>
      </div>
    </div>
  );
}
