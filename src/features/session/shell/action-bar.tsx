"use client";

import { Icon } from "@/components/ui";
import { useActionBarSpace } from "./use-action-bar-space";

/**
 * Thanh hành động dính đáy của Learning Studio (mọi viewport): một hàng gọn —
 * lý do chưa nộp được (trái, ≥sm) + Lưu nháp + Nộp bài (nút teal duy nhất).
 * Trên mobile lý do là một dòng nhỏ phía trên nút. Phím tắt chỉ hiện ≥lg và
 * trong `title` nên không tốn thêm hàng. Chiều cao thật được báo về shell.
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
  const reason = !canSubmit && submitDisabledReason ? submitDisabledReason : null;
  return (
    <div
      ref={barRef}
      style={{ bottom: keyboardInset }}
      className="fixed inset-x-0 z-20 border-t border-border/80 bg-surface/95 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] pt-1 shadow-[0_-10px_24px_-18px_rgb(23_44_43/0.35)] backdrop-blur sm:pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pt-2"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        {submitError && (
          <div
            role="alert"
            className="mb-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800"
          >
            <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 sm:flex-1">
            {reason && (
              <p title={reason} className="line-clamp-2 text-sm leading-[1.125rem] text-text-secondary sm:leading-5">
                {reason}
              </p>
            )}
          </div>
          <p className={reason ? "hidden shrink-0 text-sm text-text-muted xl:block" : "hidden shrink-0 text-sm text-text-muted lg:block"}>
            Ctrl/⌘+S lưu nháp · Ctrl/⌘+Enter nộp bài
          </p>
          <div className="flex items-center gap-2 sm:shrink-0 sm:gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving || isSubmitting}
              title="Lưu nháp (Ctrl/⌘+S)"
              className="pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3.5 text-base font-medium max-[359px]:min-w-11 max-[359px]:px-0 text-text-secondary hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-5"
            >
              <Icon name="save" className="h-4 w-4" />
              <span className="max-[359px]:sr-only">{isSaving ? "Đang lưu..." : "Lưu nháp"}</span>
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              title={`${submitLabel} (Ctrl/⌘+Enter)`}
              className="pressable inline-flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold leading-tight text-white shadow-card hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none sm:min-h-12 sm:min-w-52 sm:flex-none sm:px-6"
            >
              <Icon name="send" className="h-4 w-4" />
              <span>{isSubmitting ? "Đang gửi bài..." : submitLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
