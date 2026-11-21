"use client";

import { Button, Icon } from "@/components/ui";
import type { FlashcardDeckItem } from "./api";
import { formatMastery } from "./mastery";
import { normalizeYouGlishQuery } from "./youglish";

interface FlashcardProps {
  item: FlashcardDeckItem;
  isFlipped: boolean;
  dragOffset: { x: number; y: number };
  isDragging: boolean;
  flyDirection: "left" | "right" | null;
  hasNext: boolean;
  disabled?: boolean;
  onOpenYouGlish?: () => void;
  onSpeak: (phrase: string, event?: React.MouseEvent) => void;
  handlers: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  };
}

export function Flashcard({ item, isFlipped, dragOffset, isDragging, flyDirection, disabled = false, onOpenYouGlish, onSpeak, handlers }: FlashcardProps) {
  const borderColor = dragOffset.x > 30 ? "var(--color-success)" : dragOffset.x < -30 ? "var(--color-error)" : "var(--color-border)";
  return <div className="-mx-5 overflow-hidden px-5 py-2">
    <div {...handlers} className="relative flex min-h-[min(24rem,45dvh)] flex-col justify-between gap-6 rounded-2xl border bg-surface p-5 shadow-card sm:min-h-96 sm:gap-8 sm:p-8"
      style={{ transform: flyDirection ? `translateX(${flyDirection === "right" ? "120%" : "-120%"})` : `translate(${dragOffset.x}px,${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`,
        borderColor, touchAction: "pan-y", transition: isDragging ? "none" : "transform var(--duration-state) ease-out, border-color var(--duration-state) ease-out" }}>
      <header className="flex flex-wrap items-center justify-between gap-3 text-base text-text-secondary">
        <span className="inline-flex items-center rounded-lg bg-surface-subtle px-2.5 py-1 text-sm font-medium tabular-nums">Mức nhớ {formatMastery(item.masteryLevel)}</span>
        <button type="button" disabled={disabled} onClick={(event) => onSpeak(item.phrase, event)} onPointerDown={(event) => event.stopPropagation()}
          className="pressable -mr-2 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 font-medium text-primary-dark hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60" aria-label="Nghe phát âm từ">
          <Icon name="volume" className="h-5 w-5" />Nghe
        </button>
      </header>
      <div className="space-y-5" aria-live="polite">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            aria-hidden="true"
            className="aspect-video w-full rounded-xl object-cover"
            loading="lazy"
            draggable={false}
          />
        )}
        <h2 className="break-words text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl">{item.phrase}</h2>
        {item.ipa && <p className="break-words text-base font-mono text-text-secondary">{item.ipa}</p>}
        {isFlipped && <>
          <p className="break-words text-lg font-medium leading-relaxed text-text">{item.contextMeaning || "Chưa có nghĩa ngữ cảnh"}</p>
          {item.originalSentence && <blockquote className="break-words rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-text-secondary">{item.originalSentence}</blockquote>}
          {item.sourceRef && <p className="break-words text-sm text-text-muted">Nguồn: {item.sourceRef}</p>}
        </>}
      </div>
      <footer className="space-y-3">
        <p className="text-base text-text-muted">{isFlipped ? "Chạm để nhớ lại cụm từ." : "Nhớ nghĩa trước, rồi chạm thẻ để xem câu gốc."}</p>
        {onOpenYouGlish && <Button variant="outline" fullWidth
          disabled={disabled || !normalizeYouGlishQuery(item.phrase)}
          aria-haspopup="dialog" aria-label={`Nghe ví dụ dùng “${item.phrase}” qua YouGlish`}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            onOpenYouGlish();
          }}>
          <Icon name="play" className="h-4 w-4 shrink-0" />
          <span>Nghe ví dụ qua YouGlish</span>
        </Button>}
      </footer>
    </div>
  </div>;
}
