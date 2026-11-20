"use client";

/**
 * useDeckKeyboard — phím tắt desktop của màn flashcard (giữ nguyên bản cũ):
 *  [← / A] Chưa thuộc · [→ / D] Đã thuộc · [Space / ↑ / ↓] Lật · [Z / Backspace] Undo
 * Bỏ qua khi focus đang trong INPUT/TEXTAREA.
 */
import { useEffect } from "react";

export interface DeckKeyboardOptions {
  /** Khoá phím tắt (đang lưu / thẻ đang bay / đã kết thúc). */
  disabled: boolean;
  onDontKnow: () => void;
  onKnow: () => void;
  onFlip: () => void;
  onUndo: () => void;
}

export function useDeckKeyboard({
  disabled,
  onDontKnow,
  onKnow,
  onFlip,
  onUndo,
}: DeckKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, select, button, a, [contenteditable='true']")) return;
      if (document.querySelector("dialog[open], [aria-modal='true']")) return;
      if (disabled) return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        onDontKnow();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        onKnow();
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        onFlip();
      } else if (e.key === "z" || e.key === "Z" || e.key === "Backspace") {
        e.preventDefault();
        onUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onDontKnow, onKnow, onFlip, onUndo]);
}
