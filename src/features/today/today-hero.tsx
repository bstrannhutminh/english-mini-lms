"use client";

/**
 * TodayHero — khối chào đầu trang Hôm nay: lời chào, streak (chỉ khi > 0),
 * tagline mục tiêu, và StartControls chọn 30'/45'. Link Hồ sơ/Cài đặt đã
 * chuyển vào menu "Tôi" trong AppNav (spec §3.2) nên không lặp lại ở đây.
 */
import { Icon } from "@/components/ui";
import { StartControls } from "./start-controls";

export interface TodayHeroProps {
  displayName?: string;
  /** null/undefined/<=0 → không hiển thị chip streak (invariant). */
  streakDays?: number | null;
  targetMinutes: 30 | 45;
  onSelectMinutes: (mins: 30 | 45) => void;
}

export function TodayHero({
  displayName,
  streakDays,
  targetMinutes,
  onSelectMinutes,
}: TodayHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6 text-white shadow-sm sm:p-7">
      <div className="relative z-10 space-y-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Xin chào, {displayName || "Bác sĩ Minh"}
          </h1>
          {typeof streakDays === "number" && streakDays > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
              <Icon name="flame" className="h-3.5 w-3.5 text-amber-400" />
              <span className="tabular-nums">{streakDays} ngày liên tiếp</span>
            </div>
          )}
        </div>
        <p className="max-w-lg text-sm leading-relaxed text-slate-300">
          Mục tiêu phản xạ tiếng Anh y khoa &amp; IELTS 7.5–8.0 với 30–45 phút
          tập trung mỗi ngày.
        </p>
      </div>

      <StartControls
        targetMinutes={targetMinutes}
        onSelect={onSelectMinutes}
      />
    </div>
  );
}
