"use client";

import { useEffect, useRef } from "react";
import { computeTooltipPosition } from "@/lib/tour-position";
import type { TourStep } from "./tour-steps";
import { TourTooltip } from "./tour-tooltip";
import { useGuidedTourLayout, TOOLTIP_MAX_WIDTH, VIEWPORT_MARGIN, DESKTOP_MIN_WIDTH, SPOTLIGHT_PADDING } from "./use-guided-tour-layout";

interface GuidedTourProps {
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  /** Không tìm thấy phần tử đích sau khi thử lại → bỏ qua bước này. */
  onTargetMissing: () => void;
}

/**
 * Lớp phủ + spotlight + tooltip của một bước hướng dẫn. Component cha nên đặt
 * `key={step.id}` để state được reset sạch giữa các bước.
 */
export function GuidedTour({
  step,
  index,
  total,
  onNext,
  onBack,
  onSkip,
  onTargetMissing,
}: GuidedTourProps) {
  const tooltipRef = useRef<HTMLDialogElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const { ready, rect, viewport, tooltipSize } = useGuidedTourLayout(step, tooltipRef, onTargetMissing);

  // 4) Đưa focus vào nút "Tiếp" cho người dùng bàn phím / trình đọc màn hình
  useEffect(() => {
    if (ready) nextRef.current?.focus();
  }, [ready]);

  // 5) Phím tắt: Esc = bỏ qua, ← / → = lui / tiếp
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        onBack();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, onBack, onNext, onSkip]);

  if (!ready) return null;

  const isDesktop = viewport.width >= DESKTOP_MIN_WIDTH;
  const placement = isDesktop
    ? step.placement
    : (step.placementMobile ?? step.placement);

  const hasTarget = Boolean(step.target);
  const positioned = viewport.width > 0 && (!hasTarget || rect !== null);
  const tooltipWidth = Math.min(
    TOOLTIP_MAX_WIDTH,
    Math.max(viewport.width - VIEWPORT_MARGIN * 2, 0) || TOOLTIP_MAX_WIDTH,
  );

  const position = computeTooltipPosition({
    target: hasTarget ? rect : null,
    tooltip: { width: tooltipWidth, height: tooltipSize.height },
    viewport,
    placement,
    margin: VIEWPORT_MARGIN,
  });

  return (
    <>
      {/* Bắt click ra ngoài = bỏ qua hướng dẫn, đồng thời chặn thao tác với trang bên dưới */}
      <div
        className="fixed inset-0 z-[9998]"
        aria-hidden="true"
        onClick={onSkip}
      />

      {/* Spotlight: ô sáng quanh phần tử đích, phần còn lại được làm tối bằng box-shadow */}
      {hasTarget && rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[9999] rounded-xl ring-2 ring-primary shadow-[0_0_0_9999px_rgba(23,44,43,0.28)] transition-all duration-200 motion-reduce:transition-none"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9999] bg-slate-900/30"
        />
      )}

      <TourTooltip
        step={step}
        index={index}
        total={total}
        position={position}
        width={tooltipWidth}
        positioned={positioned}
        tooltipRef={tooltipRef}
        nextRef={nextRef}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
      />
    </>
  );
}
