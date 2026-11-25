"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type TextareaHTMLAttributes,
} from "react";

export interface AutoResizeTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Trần chiều cao (px) cho ô nhỏ — vượt quá mới cuộn trong khung.
   * Bỏ trống = cao không giới hạn theo nội dung (đúng cho ô viết chính:
   * learner không bao giờ phải cuộn trong khung nhỏ trên mobile).
   */
  maxHeight?: number;
}

/**
 * Textarea tự cao theo nội dung — trên mobile learner không phải cuộn trong
 * khung nhỏ hay kéo tay góc resize. min-height vẫn do className quyết định
 * (CSS min-height thắng height inline), trần cao qua prop `maxHeight`.
 * Thuần thuộc tính trình duyệt, không animation nên không ảnh hưởng
 * prefers-reduced-motion.
 */
export function AutoResizeTextarea({
  maxHeight,
  value,
  rows = 3,
  style,
  ...rest
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Reset về auto để scrollHeight đo đúng nội dung (min-height CSS vẫn giữ).
    el.style.height = "auto";
    const content = el.scrollHeight;
    const capped = maxHeight != null ? Math.min(content, maxHeight) : content;
    el.style.height = `${capped}px`;
    el.style.overflowY = maxHeight != null && content > maxHeight ? "auto" : "hidden";
  }, [maxHeight]);

  // Co giãn theo nội dung mỗi khi value đổi (gõ tay, autosave khôi phục nháp).
  useEffect(() => {
    resize();
  }, [value, resize]);

  // Xoay màn hình / đổi bề rộng → chữ xuống dòng khác → đo lại.
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={rows}
      {...rest}
      // Autoresize thay thế kéo tay — tránh hai cơ chế resize xung đột.
      style={{ ...style, resize: "none" }}
    />
  );
}
