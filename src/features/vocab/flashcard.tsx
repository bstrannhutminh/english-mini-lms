"use client";

import { Icon } from "@/components/ui";
import type { FlashcardDeckItem } from "./api";
import { formatMastery } from "./mastery";

interface FlashcardProps {
  item: FlashcardDeckItem;
  isFlipped: boolean;
  dragOffset: { x: number; y: number };
  isDragging: boolean;
  flyDirection: "left" | "right" | null;
  hasNext: boolean;
  onSpeak: (phrase: string, event?: React.MouseEvent) => void;
  handlers: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  };
}

export function Flashcard({ item, isFlipped, dragOffset, isDragging, flyDirection, onSpeak, handlers }: FlashcardProps) {
  const borderColor = dragOffset.x > 30 ? "var(--color-success)" : dragOffset.x < -30 ? "var(--color-error)" : "var(--color-border)";
  return <div className="overflow-hidden py-2">
    <div {...handlers} className="relative flex min-h-80 flex-col justify-between gap-6 rounded-xl border bg-surface p-6"
      style={{ transform: flyDirection ? `translateX(${flyDirection === "right" ? "120%" : "-120%"})` : `translate(${dragOffset.x}px,${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`,
        borderColor, touchAction: "pan-y", transition: isDragging ? "none" : "transform var(--duration-state) ease-out, border-color var(--duration-state) ease-out" }}>
      <header className="flex flex-wrap items-center justify-between gap-3 text-base text-text-secondary">
        <span className="tabular-nums">Mức nhớ {formatMastery(item.masteryLevel)}</span>
        <button type="button" onClick={(event) => onSpeak(item.phrase, event)} onPointerDown={(event) => event.stopPropagation()}
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 hover:bg-surface-muted" aria-label="Nghe phát âm từ">
          <Icon name="volume" className="h-5 w-5" />Nghe
        </button>
      </header>
      <div className="space-y-4" aria-live="polite">
        <h2 className="break-words text-3xl font-semibold leading-snug text-text">{item.phrase}</h2>
        {item.ipa && <p className="break-words text-base font-mono text-text-secondary">{item.ipa}</p>}
        {isFlipped && <>
          <p className="break-words text-lg font-medium leading-relaxed text-text">{item.contextMeaning || "Chưa có nghĩa ngữ cảnh"}</p>
          {item.originalSentence && <blockquote className="break-words border-l-2 border-border pl-4 text-base leading-relaxed text-text-secondary">{item.originalSentence}</blockquote>}
          {item.sourceRef && <p className="break-words text-base text-text-muted">Nguồn: {item.sourceRef}</p>}
        </>}
      </div>
      <p className="text-base text-text-muted">{isFlipped ? "Chạm để nhớ lại cụm từ." : "Nhớ nghĩa trước, rồi chạm thẻ để xem câu gốc."}</p>
    </div>
  </div>;
}
