"use client";

import { useEffect } from "react";

/**
 * Phím tắt mức shell (mọi mode):
 * - Ctrl/Cmd + S: lưu nháp ngay (kể cả đang gõ trong textarea)
 * - Ctrl/Cmd + Enter: nộp bài (chỉ khi plugin báo canSubmit.ok)
 * - Escape: đóng popup/modal đang mở (capture → wrap-up)
 * Phím thường trong input/textarea không bị chặn.
 */
export function useSessionHotkeys(handlers: {
  onSaveDraft: () => void;
  onSubmit: () => void;
  onEscape: () => void;
  canSubmit: boolean;
  enabled?: boolean;
}): void {
  const { onSaveDraft, onSubmit, onEscape, canSubmit, enabled = true } = handlers;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!enabled || document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')) return;
      const withMod = event.ctrlKey || event.metaKey;
      if (withMod && event.key === "s") {
        event.preventDefault();
        onSaveDraft();
        return;
      }
      if (withMod && event.key === "Enter") {
        event.preventDefault();
        if (canSubmit) onSubmit();
        return;
      }
      if (event.key === "Escape") {
        onEscape();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSaveDraft, onSubmit, onEscape, canSubmit, enabled]);
}
