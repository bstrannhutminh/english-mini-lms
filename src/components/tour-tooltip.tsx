"use client";

import type { RefObject } from "react";
import type { TooltipPosition } from "@/lib/tour-position";
import type { TourStep } from "./tour-steps";

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
  tooltipRef: RefObject<HTMLDivElement | null>;
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

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`tour-title-${step.id}`}
      aria-describedby={`tour-body-${step.id}`}
      className="fixed z-[10000] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition-[top,left,opacity] duration-200 motion-reduce:transition-none"
      style={{
        top: position.top,
        left: position.left,
        width,
        opacity: positioned ? 1 : 0,
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
        Bước {index + 1}/{total}
      </p>
      <h2
        id={`tour-title-${step.id}`}
        className="mt-1 text-base font-bold text-slate-900"
      >
        {step.title}
      </h2>
      <p
        id={`tour-body-${step.id}`}
        className="mt-1.5 text-sm leading-relaxed text-slate-600"
      >
        {step.body}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] px-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
        >
          Bỏ qua
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Lui
            </button>
          )}
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className="min-h-[44px] rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isLast ? "Hoàn tất" : "Tiếp"}
          </button>
        </div>
      </div>
    </div>
  );
}
