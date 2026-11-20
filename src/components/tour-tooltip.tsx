"use client";

import { useEffect, type RefObject } from "react";
import type { TooltipPosition } from "@/lib/tour-position";
import type { TourStep } from "./tour-steps";
import { containDialogFocus } from "./ui/dialog-focus";

interface TourTooltipProps {
  step: TourStep;
  index: number;
  total: number;
  /** Vị trí đã tính (toạ độ viewport, position: fixed). */
  position: TooltipPosition;
  /** px — đã kẹp theo viewport. */
  width: number;
  /** false → opacity 0 trong lúc chờ đo xong. */
  positioned: boolean;
  /** Ref để auto-focus nút Tiếp (a11y). */
  tooltipRef: RefObject<HTMLDialogElement | null>;
  nextRef: RefObject<HTMLButtonElement | null>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/** Tooltip/hộp thoại của một bước hướng dẫn — thuần trình bày. */
export function TourTooltip({
  step,
  index,
  total,
  position,
  width,
  positioned,
  tooltipRef,
  nextRef,
  onNext,
  onBack,
  onSkip,
}: TourTooltipProps) {
  const isLast = index === total - 1;

  useEffect(() => {
    const dialog = tooltipRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [tooltipRef]);

  return (
    <dialog
      ref={tooltipRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`tour-title-${step.id}`}
      aria-describedby={`tour-body-${step.id}`}
      onCancel={(event) => { event.preventDefault(); onSkip(); }}
      onKeyDown={containDialogFocus}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onSkip();
      }}
      className="lms-tour-dialog fixed z-[10000] m-0 max-h-[calc(100dvh-1.5rem)] max-w-none overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-pop transition-[top,left,opacity] duration-200 motion-reduce:transition-none"
      style={{
        top: position.top,
        left: position.left,
        width,
        opacity: positioned ? 1 : 0,
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark">
        Bước {index + 1}/{total}
      </p>
      <h2
        id={`tour-title-${step.id}`}
        className="mt-2 text-lg font-semibold text-text"
      >
        {step.title}
      </h2>
      <p
        id={`tour-body-${step.id}`}
        className="mt-2 text-base leading-relaxed text-text-secondary"
      >
        {step.body}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-11 min-w-11 cursor-pointer px-1 text-base font-medium text-text-muted hover:text-text hover:underline"
        >
          Bỏ qua
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-11 cursor-pointer rounded-lg border border-border-strong px-3 text-base font-medium text-text-secondary hover:bg-surface-muted"
            >
              Lui
            </button>
          )}
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className="min-h-11 cursor-pointer rounded-lg bg-primary px-4 text-base font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {isLast ? "Hoàn tất" : "Tiếp"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
