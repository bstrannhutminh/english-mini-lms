"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./icons";

export interface ModalProps {
  open: boolean;
  /** Đóng khi bấm ESC / nền tối. Truyền undefined để cấm đóng (bắt buộc chọn). */
  onClose?: () => void;
  /** Tiêu đề — gắn aria-labelledby. */
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Hàng nút cuối modal (thường là <Button>). */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Hiện nút X góc phải (mặc định có khi onClose tồn tại). */
  showClose?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
} as const;

/**
 * Modal chuẩn: lớp nền mờ, ESC/click nền để đóng, khoá scroll body,
 * tự focus panel khi mở. Không dùng portal — z-index --z-modal đủ cao.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showClose = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const dismissable = Boolean(onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // Khoá scroll nền trong lúc modal mở
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-modal) flex items-end justify-center sm:items-center"
      role="presentation"
      onClick={dismissable ? onClose : undefined}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-xs"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full animate-slide-up rounded-t-2xl border border-border bg-surface p-5 shadow-pop outline-none",
          "max-h-[85dvh] overflow-y-auto sm:animate-zoom-in sm:rounded-2xl sm:p-6",
          SIZE_CLASSES[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2
              id={titleId}
              className="text-lg font-semibold leading-snug text-text"
            >
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          {dismissable && showClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? (
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
