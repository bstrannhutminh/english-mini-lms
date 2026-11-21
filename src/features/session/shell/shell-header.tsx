"use client";

import type { Ref } from "react";
import { Icon, SkillTile } from "@/components/ui";
import { SKILL_INFO, type Skill } from "@/lib/modes";
import { cn } from "@/lib/utils";

interface ShellHeaderProps {
  title: string;
  skill: Skill;
  isIelts: boolean;
  isRevision: boolean;
  timerFormatted: string;
  timerActive: boolean;
  isLowTime: boolean;
  /** Phần thời gian mục tiêu đã dùng, 0–1 (shell tính từ đồng hồ phiên). */
  elapsedRatio: number;
  onToggleTimer: () => void;
  onRequestExit: () => void;
  saveStatus: {
    lastSavedAt: string | null;
    isSaving: boolean;
    saveFailed: boolean;
    onRetrySave: () => void;
  };
  /** Shell đo chiều cao thật để đặt offset sticky cho công tắc/cột đề bài. */
  headerRef?: Ref<HTMLElement>;
}

/**
 * Thanh ứng dụng của Learning Studio: tràn hết chiều ngang, dính đỉnh, một hàng
 * gọn (thoát · kỹ năng + tiêu đề + trạng thái lưu · đồng hồ) và vạch tiến độ
 * thời gian phiên ngay bên dưới.
 */
export function ShellHeader({
  title, skill, isIelts, isRevision, timerFormatted, timerActive, isLowTime,
  elapsedRatio, onToggleTimer, onRequestExit, saveStatus, headerRef,
}: ShellHeaderProps) {
  const meta = SKILL_INFO[skill];
  const percent = Math.round(Math.min(1, Math.max(0, elapsedRatio)) * 100);
  const hasExtraMeta = isIelts || isRevision;
  const idle = !saveStatus.isSaving && !saveStatus.saveFailed && !saveStatus.lastSavedAt;
  const toneClass = isLowTime
    ? "border-red-300 bg-red-50 text-red-800"
    : timerActive
      ? "border-border bg-surface text-text hover:border-border-strong"
      : "border-amber-300 bg-amber-50 text-amber-900";

  return (
    <header ref={headerRef} className="sticky top-0 z-30">
      <div className="border-b border-border bg-surface/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-2 px-2 sm:gap-3 sm:px-6 lg:h-16">
          <button
            type="button"
            onClick={onRequestExit}
            aria-label="Lưu và thoát"
            className="pressable inline-flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl text-base font-medium text-text-secondary hover:bg-surface-subtle hover:text-text sm:px-3"
          >
            <Icon name="arrow-left" className="h-5 w-5" />
            <span className="hidden sm:inline">Lưu và thoát</span>
          </button>
          <span aria-hidden="true" className="hidden h-6 w-px shrink-0 bg-border sm:block" />
          <SkillTile mode={skill} size="sm" />

          <div className="min-w-0 flex-1">
            <h1 title={title} className="truncate text-base font-semibold leading-5 tracking-tight text-text lg:overflow-visible lg:whitespace-normal lg:text-lg lg:leading-6">
              {title}
            </h1>
            <div className="flex min-w-0 items-center text-sm leading-5 text-text-muted">
              <span className={cn("min-w-0 truncate max-[359px]:hidden", saveStatus.saveFailed && "hidden sm:inline")}>
                <span className={cn(hasExtraMeta && "hidden sm:inline")}>{meta.shortLabel}{hasExtraMeta && " · "}</span>
                {isIelts && <span>IELTS<span className="hidden sm:inline"> ·</span> luyện tập</span>}
                {isRevision && (
                  <span className={cn(isIelts && "hidden sm:inline")}>
                    {isIelts && " · "}<span className="font-medium text-primary-dark">Bản sửa</span>
                  </span>
                )}
              </span>
              <span aria-hidden="true" className={cn("shrink-0 whitespace-pre max-[359px]:hidden", (saveStatus.saveFailed || (hasExtraMeta && idle)) && "hidden sm:inline")}> · </span>
              <div role="status" aria-live="polite" className="flex shrink-0 items-center">
                <SaveStatus {...saveStatus} compact={hasExtraMeta} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTimer}
            title={timerActive ? "Tạm dừng đồng hồ" : "Tiếp tục đồng hồ"}
            aria-label={`${timerActive ? "Tạm dừng" : "Tiếp tục"} đồng hồ, còn ${timerFormatted}`}
            className={cn("pressable inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-base font-semibold tabular-nums", toneClass)}
          >
            <Icon name="clock" className="hidden h-4 w-4 sm:block" />
            {timerFormatted}
            <Icon name={timerActive ? "pause" : "play"} className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Thời gian đã dùng trong phiên học"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`Đã dùng ${percent}% thời gian mục tiêu`}
        className="h-[3px] w-full bg-border-subtle"
      >
        <div
          className={cn("h-full rounded-r-full transition-[width] duration-1000 ease-linear", isLowTime ? "bg-red-500" : timerActive ? "bg-primary" : "bg-amber-500")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}

/**
 * Trạng thái lưu nháp trung thực: đang lưu · lỗi (kèm thử lại) · đã lưu · chờ tự lưu.
 * `compact` (có nhãn IELTS/Bản sửa): trên mobile chỉ còn dấu tích + giờ để không cắt nhãn.
 */
function SaveStatus({ lastSavedAt, isSaving, saveFailed, onRetrySave, compact }: ShellHeaderProps["saveStatus"] & { compact: boolean }) {
  if (isSaving) return <span>Đang lưu<span className="hidden sm:inline"> nháp</span>…</span>;
  if (saveFailed) {
    // -my-3 giữ vùng chạm 44px mà không làm cao thanh tiêu đề.
    return (
      <button type="button" onClick={onRetrySave} className="-my-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg text-sm font-semibold text-red-800 underline underline-offset-4">
        <Icon name="refresh" className="h-4 w-4" />Chưa lưu được — thử lại
      </button>
    );
  }
  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1">
        <Icon name="check" className="h-3.5 w-3.5 text-emerald-700" />
        <span>
          <span className={cn(compact && "sr-only sm:not-sr-only")}>Đã lưu</span>
          <span className="hidden sm:inline"> nháp lúc</span> {lastSavedAt}
        </span>
      </span>
    );
  }
  return (
    <span>
      <span className={cn("sm:hidden", compact && "hidden")}>Tự lưu nháp</span>
      <span className="hidden sm:inline">Nháp sẽ tự lưu khi bạn làm bài</span>
    </span>
  );
}
