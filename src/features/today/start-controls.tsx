"use client";

/**
 * StartControls — bộ chọn thời lượng mục tiêu 30'/45' (segmented control,
 * nằm trong TodayHero). Đổi lựa chọn → refetch gợi ý + kế hoạch theo khung đó.
 */
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface StartControlsProps {
  targetMinutes: 30 | 45;
  onSelect: (mins: 30 | 45) => void;
}

const OPTIONS: Array<{ value: 30 | 45; label: string }> = [
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
];

export function StartControls({ targetMinutes, onSelect }: StartControlsProps) {
  return (
    <div className="relative z-10 mt-6 flex flex-col gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm">
        <Icon name="clock" className="h-4 w-4 text-teal-400" />
        <span>Thời lượng học mục tiêu hôm nay:</span>
      </div>

      <div
        role="group"
        aria-label="Chọn thời lượng học mục tiêu"
        className="inline-flex rounded-xl border border-slate-800/80 bg-slate-950/70 p-1"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={targetMinutes === opt.value}
            className={cn(
              "min-h-11 cursor-pointer rounded-lg px-4 text-xs font-semibold transition-all sm:text-sm",
              targetMinutes === opt.value
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
