"use client";

import { useEffect, useState } from "react";

/**
 * Đo phần bàn phím ảo che mất đáy màn hình (visualViewport API — iOS Safari).
 * Trả về 0 khi bàn phím đóng / không hỗ trợ. Cùng công thức với action bar
 * của khung phiên học: innerHeight - viewport.height - viewport.offsetTop.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const measure = () => {
      const next = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      setInset(next);
    };

    measure();
    viewport.addEventListener("resize", measure);
    viewport.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    return () => {
      viewport.removeEventListener("resize", measure);
      viewport.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return inset;
}
