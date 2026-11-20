"use client";

import { Icon } from "@/components/ui";
import { SKILL_INFO, type Skill } from "@/lib/modes";

interface ShellHeaderProps {
  title: string;
  skill: Skill;
  isIelts: boolean;
  isRevision: boolean;
  timerFormatted: string;
  timerActive: boolean;
  isLowTime: boolean;
  onToggleTimer: () => void;
  onRequestExit: () => void;
  saveStatus: {
    lastSavedAt: string | null;
    isSaving: boolean;
    saveFailed: boolean;
    onRetrySave: () => void;
  };
}

/** Keep the lesson, timer and save status readable while working on a phone. */
export function ShellHeader({
  title, skill, isIelts, isRevision, timerFormatted, timerActive, isLowTime,
  onToggleTimer, onRequestExit, saveStatus,
}: ShellHeaderProps) {
  const meta = SKILL_INFO[skill];
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-6 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onRequestExit} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-base font-medium text-text-secondary hover:bg-surface-muted">
          <Icon name="arrow-left" className="h-4 w-4" />
          Lưu và thoát
        </button>
        <button
          type="button" onClick={onToggleTimer}
          aria-label={`${timerActive ? "Tạm dừng" : "Tiếp tục"} đồng hồ, còn ${timerFormatted}`}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-base font-semibold tabular-nums ${isLowTime ? "border-red-300 bg-red-50 text-red-800" : timerActive ? "border-border bg-surface-muted text-text" : "border-amber-300 bg-amber-50 text-amber-900"}`}
        >
          <Icon name="clock" className="h-4 w-4" />
          {timerFormatted}
          <Icon name={timerActive ? "pause" : "play"} className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-text-secondary">
        <span className="inline-flex items-center gap-1.5"><Icon name={meta.icon} className="h-4 w-4" />{meta.shortLabel}</span>
        {isIelts && <span>IELTS · luyện tập</span>}
        {isRevision && <span className="text-primary-dark">Bản sửa</span>}
      </div>
      <h1 className="mt-1 break-words text-lg font-semibold leading-snug text-text sm:text-xl">{title}</h1>
      <div role="status" aria-live="polite" className="mt-1 text-base text-text-secondary">
        {saveStatus.isSaving ? "Đang lưu nháp…" : saveStatus.saveFailed ? (
          <button type="button" onClick={saveStatus.onRetrySave} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-base font-medium text-red-800 underline underline-offset-4">
            <Icon name="refresh" className="h-4 w-4" />Chưa lưu được — thử lại
          </button>
        ) : saveStatus.lastSavedAt ? `Đã lưu nháp lúc ${saveStatus.lastSavedAt}` : "Nháp sẽ tự lưu khi bạn làm bài"}
      </div>
    </header>
  );
}
