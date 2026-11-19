"use client";

import { Icon } from "@/components/ui";
import { StartControls } from "./start-controls";

export interface TodayHeroProps {
  displayName?: string;
  /** null/undefined/<=0 → không hiển thị chip streak (invariant). */
  streakDays?: number | null;
  targetMinutes: 30 | 45;
  onSelectMinutes: (mins: 30 | 45) => void;
}

/**
 * Header nhẹ nhàng, thanh lịch đầu trang Hôm nay:
 * lời chào + streak (chỉ khi > 0) + chọn nhanh phiên 30'/45'.
 */
export function TodayHero({
  displayName,
  streakDays,
  targetMinutes,
  onSelectMinutes,
}: TodayHeroProps) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
            Xin chào, {displayName || "Bác sĩ Minh"}
          </h1>
          {typeof streakDays === "number" && streakDays > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              <Icon name="flame" className="h-3.5 w-3.5 text-amber-600" />
              <span className="tabular-nums">{streakDays} ngày liên tiếp</span>
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary">
          Tập trung {targetMinutes} phút hôm nay — làm bài thật, nhận góp ý AI và
          sửa lại để tiến bộ bền vững.
        </p>
      </div>

      <StartControls
        targetMinutes={targetMinutes}
        onSelect={onSelectMinutes}
      />
    </header>
  );
}
