"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { TourRect, TourSize } from "@/lib/tour-position";
import type { TourStep } from "./tour-steps";

/** Tìm phần tử đích tối đa 12 × 250ms (3 giây) — trang có thể còn đang tải dữ liệu. */
const MAX_FIND_ATTEMPTS = 12;
const FIND_INTERVAL_MS = 250;
export const SPOTLIGHT_PADDING = 6;
export const TOOLTIP_MAX_WIDTH = 340;
export const VIEWPORT_MARGIN = 12;
export const DESKTOP_MIN_WIDTH = 1024;

/**
 * Cùng một data-tour có thể xuất hiện 2 lần (thanh dưới mobile + sidebar desktop),
 * chỉ một trong hai đang hiển thị → chọn phần tử có kích thước > 0.
 */
function findVisibleTarget(name: string): HTMLElement | null {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`),
  );
  for (const node of nodes) {
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return node;
  }
  return null;
}

export function useGuidedTourLayout(
  step: TourStep,
  tooltipRef: RefObject<HTMLDialogElement | null>,
  onTargetMissing: () => void,
) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<TourRect | null>(null);
  const [ready, setReady] = useState(!step.target);
  const [viewport, setViewport] = useState<TourSize>({ width: 0, height: 0 });
  const [tooltipSize, setTooltipSize] = useState<TourSize>({
    width: TOOLTIP_MAX_WIDTH,
    height: 200,
  });

  const onMissingRef = useRef(onTargetMissing);

  useEffect(() => {
    onMissingRef.current = onTargetMissing;
  }, [onTargetMissing]);

  // 1) Tìm phần tử đích (có thử lại), cuộn vào giữa màn hình
  useEffect(() => {
    const name = step.target;
    if (!name) return;

    let attempts = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const find = () => {
      if (cancelled) return;
      const el = findVisibleTarget(name);
      if (el) {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        el.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: reduce ? "auto" : "smooth",
        });
        setTarget(el);
        setReady(true);
        return;
      }
      attempts += 1;
      if (attempts >= MAX_FIND_ATTEMPTS) {
        onMissingRef.current();
        return;
      }
      timer = setTimeout(find, FIND_INTERVAL_MS);
    };

    timer = setTimeout(find, 0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [step.target]);

  // 2) Theo dõi vị trí phần tử đích + kích thước viewport
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      if (target) {
        const r = target.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("resize", schedule);
    // capture = true để bắt cả cuộn của container con
    window.addEventListener("scroll", schedule, true);
    // Bắt trường hợp bố cục dịch chuyển khi dữ liệu tải xong (không có sự kiện cuộn)
    const interval = setInterval(schedule, 500);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearInterval(interval);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [target]);

  // 3) Đo kích thước thật của tooltip để định vị chính xác
  useEffect(() => {
    const node = tooltipRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      setTooltipSize({ width: node.offsetWidth, height: node.offsetHeight });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, tooltipRef]);

  return { ready, rect, viewport, tooltipSize };
}
