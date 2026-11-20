"use client";

import { useEffect, useRef, useState } from "react";

/** Reserve the actual bar height, including wrapped errors and the visual keyboard. */
export function useActionBarSpace(onHeightChange?: (height: number) => void) {
  const barRef = useRef<HTMLDivElement>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    const measure = () => {
      const inset = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
      setKeyboardInset(inset);
      onHeightChange?.((barRef.current?.getBoundingClientRect().height ?? 0) + inset);
    };
    const observer = new ResizeObserver(measure);
    if (barRef.current) observer.observe(barRef.current);
    const frame = requestAnimationFrame(measure);
    viewport?.addEventListener("resize", measure);
    viewport?.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport?.removeEventListener("resize", measure);
      viewport?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [onHeightChange]);
  return { barRef, keyboardInset };
}
