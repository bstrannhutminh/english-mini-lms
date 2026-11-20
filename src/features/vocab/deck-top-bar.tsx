"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import type { DeckFilterMode } from "./use-flashcard-deck";

interface DeckTopBarProps {
  currentIndex: number;
  total: number;
  filterMode: DeckFilterMode;
  disabled?: boolean;
  onModeChange: (mode: DeckFilterMode) => void;
  onFinishEarly: () => void;
}

export function DeckTopBar({ currentIndex, total, filterMode, disabled, onModeChange, onFinishEarly }: DeckTopBarProps) {
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/vocab" aria-label="Quay lại Sổ từ" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-base text-text-secondary"><Icon name="arrow-left" className="h-4 w-4" />Sổ từ</Link>
      <p className="text-base tabular-nums text-text-secondary">Thẻ {Math.min(currentIndex + 1, total)} / {total}</p>
      <button disabled={disabled} onClick={onFinishEarly} className="min-h-11 rounded-lg px-3 text-base font-medium text-text-secondary hover:bg-surface-subtle">Kết thúc</button>
    </div>
    <div role="group" aria-label="Bộ thẻ ôn" className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1">
      {([['due','Đến hạn'],['all','Ôn tự do']] as const).map(([mode,label]) => <button key={mode} disabled={disabled} aria-pressed={filterMode === mode} onClick={() => onModeChange(mode)}
        className={`min-h-11 rounded-lg px-3 text-base font-medium transition-colors ${filterMode === mode ? "bg-surface-subtle text-primary-dark" : "text-text-secondary hover:bg-surface-muted"}`}>{label}</button>)}
    </div>
    <progress aria-label="Tiến trình ôn thẻ" value={currentIndex} max={Math.max(1,total)} className="h-2 w-full accent-primary" />
  </div>;
}
