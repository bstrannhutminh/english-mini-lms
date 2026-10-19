"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { normalizeYouGlishQuery } from "./youglish";
import { YouGlishModal } from "./youglish-modal";

interface YouGlishButtonProps {
  query: string;
  label?: string;
  className?: string;
}

/**
 * Nút mở YouGlish trong modal. Widget KHÔNG được nhúng sẵn — chỉ mount khi
 * người học bấm và được huỷ ngay khi đóng modal.
 */
export function YouGlishButton({
  query,
  label = "🔊 Nghe người bản xứ nói",
  className,
}: YouGlishButtonProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const disabled = !normalizeYouGlishQuery(query);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {label}
      </button>
      {open && createPortal(<YouGlishModal query={query} onClose={close} />, document.body)}
    </>
  );
}
