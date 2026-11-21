"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Track an element's rendered height (ResizeObserver) so sticky offsets below
 * the studio header follow the real chrome size (safe-area, wrapped title…).
 */
export function useMeasuredHeight<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // The observer fires once on observe(), so no synchronous measure is needed.
    const observer = new ResizeObserver(() => {
      setHeight(Math.round(element.getBoundingClientRect().height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, height };
}
