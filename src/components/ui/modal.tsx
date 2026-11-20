"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./icons";
import { containDialogFocus } from "./dialog-focus";

export interface ModalProps {
  open: boolean;
  /** Undefined keeps a pending or mandatory dialog from being dismissed. */
  onClose?: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
} as const;

let scrollLockCount = 0;
let previousBodyOverflow = "";

/** Nested dialogs can unmount in either order; only the last one unlocks the page. */
function lockModalScroll() {
  if (scrollLockCount === 0) previousBodyOverflow = document.body.style.overflow;
  scrollLockCount += 1;
  document.body.style.overflow = "hidden";
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.body.style.overflow = previousBodyOverflow;
  };
}

/** Native top-layer dialog provides focus containment and an inert background. */
export function Modal({
  open, onClose, title, description, children, footer,
  size = "md", showClose = true, className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  // Only opening/closing owns focus. A changing timer callback must not reset it.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlockScroll = lockModalScroll();
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    return () => {
      dialog.close();
      unlockScroll();
      if (trigger?.isConnected && !trigger.closest("[inert]")) trigger.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-modal="true"
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target === event.currentTarget) closeRef.current?.();
      }}
      onKeyDown={containDialogFocus}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          closeRef.current?.();
        }
      }}
      className={cn(
        "lms-dialog fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none animate-slide-up rounded-t-xl border border-border bg-surface p-5 text-text shadow-pop",
        "max-h-[85dvh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:inset-0 sm:m-auto sm:animate-zoom-in sm:rounded-xl sm:p-6",
        SIZE_CLASSES[size], className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h2 id={titleId} className="text-xl font-semibold leading-snug text-text">{title}</h2>
          {description ? <p id={descriptionId} className="text-base leading-relaxed text-text-secondary">{description}</p> : null}
        </div>
        {onClose && showClose ? (
          <button type="button" onClick={() => closeRef.current?.()} aria-label="Đóng"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-subtle hover:text-text">
            <Icon name="x" className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
      {footer ? <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div> : null}
    </dialog>
  );
}
