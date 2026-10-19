"use client";

import type { Skill } from "../modes/types";
import { SKILL_META } from "../modes/registry";

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
  onSaveAndExit: () => void;
  saveStatus: {
    lastSavedAt: string | null;
    isSaving: boolean;
    saveFailed: boolean;
    onRetrySave: () => void;
  };
}

/** Header dùng chung mọi mode: thoát&lưu, chip kỹ năng + IELTS, đồng hồ, chỉ báo lưu. */
export function ShellHeader({
  title,
  skill,
  isIelts,
  isRevision,
  timerFormatted,
  timerActive,
  isLowTime,
  onToggleTimer,
  onSaveAndExit,
  saveStatus,
}: ShellHeaderProps) {
  const meta = SKILL_META[skill];

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onSaveAndExit}
          title="Lưu nháp và thoát về Hôm nay"
          className="inline-flex min-h-[44px] items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          ← Thoát & lưu nháp
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold ${meta.chipClassName}`}
          >
            {meta.label}
          </span>
          {isIelts && (
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
              IELTS
            </span>
          )}
          {isRevision && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              ✍️ Đang viết bản sửa
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Trạng thái lưu nháp */}
          <div className="text-xs text-slate-500" role="status">
            {saveStatus.isSaving
              ? "Đang lưu..."
              : saveStatus.saveFailed
                ? (
                  <button
                    type="button"
                    onClick={saveStatus.onRetrySave}
                    className="text-red-600 underline underline-offset-2"
                  >
                    Lưu lỗi — thử lại
                  </button>
                )
                : saveStatus.lastSavedAt
                  ? `Đã lưu ${saveStatus.lastSavedAt}`
                  : "Chưa lưu"}
          </div>

          {/* Đồng hồ đếm ngược + tạm dừng/tiếp tục */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm font-bold tracking-wide ${
              isLowTime
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-slate-100 text-slate-800"
            }`}
          >
            <span aria-hidden>⏱️</span>
            <span>{timerFormatted}</span>
            <button
              type="button"
              onClick={onToggleTimer}
              aria-label={timerActive ? "Tạm dừng đồng hồ" : "Tiếp tục đồng hồ"}
              title={timerActive ? "Tạm dừng" : "Tiếp tục"}
              className="ml-1 inline-flex min-h-[28px] min-w-[28px] items-center justify-center rounded text-xs opacity-80 hover:opacity-100"
            >
              {timerActive ? "⏸" : "▶"}
            </button>
          </div>
        </div>
      </div>

      <h1 className="sr-only">{title}</h1>
    </div>
  );
}
