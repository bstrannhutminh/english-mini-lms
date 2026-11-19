"use client";

import { useCallback, useState } from "react";
import type { CaptureHelpers } from "../modes/types";

export interface CaptureSelection {
  selectedText: string;
  surroundingSentence: string;
  sourceRef: string;
  position: { x: number; y: number };
}

/** Tách câu bao quanh đoạn bôi đen (port từ reading-session-view). */
function extractSurroundingSentence(fullText: string, selected: string): string {
  if (!fullText || !selected) return selected;
  const index = fullText.indexOf(selected);
  if (index === -1) return selected;

  let start = index;
  while (start > 0 && !/[.!?\n]/.test(fullText[start - 1])) start--;

  let end = index + selected.length;
  while (end < fullText.length && !/[.!?\n]/.test(fullText[end])) end++;
  if (end < fullText.length && /[.!?]/.test(fullText[end])) end++;

  const sentence = fullText.slice(start, end).trim();
  return sentence.length > 0 ? sentence : selected;
}

/**
 * Bôi đen văn bản → toạ độ + câu bao quanh để shell mở SmartCapturePopup.
 * Panel lấy handlers qua `capture.selectHandlers(fullText, sourceRef)`.
 */
export function useSmartCapture(): {
  selection: CaptureSelection | null;
  close: () => void;
  helpers: CaptureHelpers;
} {
  const [selection, setSelection] = useState<CaptureSelection | null>(null);

  const handleSelection = useCallback(
    (fullText: string, sourceRef: string) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString().trim();
      if (text.length <= 1 || text.length >= 120) return;

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelection({
        selectedText: text,
        surroundingSentence: extractSurroundingSentence(fullText, text),
        sourceRef,
        position: { x: rect.left + rect.width / 2, y: rect.bottom },
      });
    },
    [],
  );

  const helpers: CaptureHelpers = {
    selectHandlers: (fullText, sourceRef) => ({
      onMouseUp: () => handleSelection(fullText, sourceRef),
      onTouchEnd: () => handleSelection(fullText, sourceRef),
    }),
  };

  return {
    selection,
    close: () => setSelection(null),
    helpers,
  };
}
