"use client";

import { useEffect, useId, useRef } from "react";
import { normalizeYouGlishQuery } from "./youglish";
import { YouGlishWidget } from "./youglish-widget";

interface YouGlishModalProps {
  query: string;
  onClose: () => void;
}

export function YouGlishModal({ query, onClose }: YouGlishModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Esc để đóng + khoá cuộn nền + trả focus khi đóng
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    // data-youglish-modal: để các popup cha (vd. smart-capture) biết click này nằm trong modal
    // và KHÔNG tự đóng theo "click ra ngoài".
    <div
      data-youglish-modal
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-[720px] sm:rounded-2xl sm:p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-base font-bold text-slate-900">
              🔊 Người bản xứ nói “{normalizeYouGlishQuery(query)}”
            </h2>
            <p className="text-xs text-slate-500">
              Video thật từ YouTube qua YouGlish · giọng Mỹ / Anh / Úc
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg text-lg text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <YouGlishWidget key={query} query={query} />
      </div>
    </div>
  );
}
