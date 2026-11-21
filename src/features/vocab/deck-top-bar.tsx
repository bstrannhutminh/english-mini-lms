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

/** Thanh trên bộ thẻ: về Sổ từ, tiến trình "Thẻ x / n" + thanh chạy, chọn bộ thẻ, kết thúc sớm. */
export function DeckTopBar({ currentIndex, total, filterMode, disabled, onModeChange, onFinishEarly }: DeckTopBarProps) {
  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <Link href="/vocab" aria-label="Quay lại Sổ từ" className="pressable -ml-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg px-2 text-base font-medium text-text-secondary hover:text-primary-dark"><Icon name="arrow-left" className="h-5 w-5 sm:h-4 sm:w-4" /><span className="max-sm:sr-only">Sổ từ</span></Link>
      <div role="group" aria-label="Bộ thẻ ôn" className="flex min-w-0 flex-1 gap-1 rounded-xl bg-surface-subtle p-1 sm:flex-none">
        {([['due','Đến hạn'],['all','Ôn tự do']] as const).map(([mode,label]) => <button key={mode} disabled={disabled} aria-pressed={filterMode === mode} onClick={() => onModeChange(mode)}
          className={`pressable min-h-11 flex-1 cursor-pointer whitespace-nowrap rounded-lg px-2 text-base font-medium disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 ${filterMode === mode ? "bg-surface text-primary-dark shadow-card ring-1 ring-inset ring-border" : "text-text-secondary hover:text-text"}`}>{label}</button>)}
      </div>
      <button disabled={disabled} onClick={onFinishEarly} className="pressable -mr-2 min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2 text-base font-medium text-text-secondary hover:bg-surface-subtle hover:text-text disabled:cursor-not-allowed disabled:opacity-60">Kết thúc</button>
    </div>
    <div className="flex items-center gap-3">
      <progress aria-label="Tiến trình ôn thẻ" value={currentIndex} max={Math.max(1,total)} className="studio-progress h-2 flex-1 rounded-full" />
      <p className="shrink-0 text-sm font-medium tabular-nums text-text-secondary">Thẻ {Math.min(currentIndex + 1, total)} / {total}</p>
    </div>
  </div>;
}
