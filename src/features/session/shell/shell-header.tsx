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
  /** Đổi màu cảnh báo khi còn < 5 phút. */
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

/**
 * Thanh đầu chế độ Tập trung (Focus Mode): thoát có xác nhận, chip kỹ năng
 * + IELTS, trạng thái tự lưu và đồng hồ đếm ngược (touch target ≥ 44px).
 */
export function ShellHeader({
  title,
  skill,
  isIelts,
  isRevision,
  timerFormatted,
  timerActive,
  isLowTime,
  onToggleTimer,
  onRequestExit,
  saveStatus,
}: ShellHeaderProps) {
  const meta = SKILL_INFO[skill];

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-surface/95 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRequestExit}
            title="Lưu nháp và thoát về Hôm nay"
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-text-secondary transition hover:bg-slate-100 hover:text-text"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            <span>Thoát</span>
          </button>

          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}
          >
            <Icon name={meta.icon} className="h-3.5 w-3.5" />
            {meta.shortLabel}
          </span>

          {isIelts && (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              IELTS
            </span>
          )}

          {isRevision && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <Icon name="pen" className="h-3 w-3" />
              Bản sửa
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Trạng thái lưu nháp */}
          <div
            className="hidden text-xs text-text-muted sm:block"
            role="status"
          >
            {saveStatus.isSaving ? (
              "Đang lưu nháp..."
            ) : saveStatus.saveFailed ? (
              <button
                type="button"
                onClick={saveStatus.onRetrySave}
                className="cursor-pointer font-semibold text-red-600 underline underline-offset-2"
              >
                Lưu lỗi — thử lại
              </button>
            ) : saveStatus.lastSavedAt ? (
              `Đã lưu ${saveStatus.lastSavedAt}`
            ) : (
              "Tự động lưu nháp"
            )}
          </div>

          {/* Đồng hồ đếm ngược + nút tạm dừng ≥ 44px */}
          <button
            type="button"
            onClick={onToggleTimer}
            aria-label={timerActive ? "Tạm dừng đồng hồ" : "Tiếp tục đồng hồ"}
            title={
              timerActive ? "Bấm để tạm dừng đồng hồ" : "Bấm để tiếp tục đồng hồ"
            }
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 font-mono text-sm font-bold tracking-wide transition ${
              isLowTime
                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : timerActive
                  ? "border-border bg-surface-muted text-text hover:bg-slate-200/70"
                  : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Icon name="clock" className="h-4 w-4 shrink-0" />
            <span className="tabular-nums">{timerFormatted}</span>
            <Icon
              name={timerActive ? "pause" : "play"}
              className="h-3.5 w-3.5 shrink-0 opacity-80"
            />
          </button>
        </div>
      </div>

      <h1 className="sr-only">{title}</h1>
    </header>
  );
}
