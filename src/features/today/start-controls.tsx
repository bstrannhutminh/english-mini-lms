"use client";

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

/** Bộ chọn thời lượng 30'/45' gọn gàng đặt ngay trong đầu trang Hôm nay. */
export function StartControls({ targetMinutes, onSelect }: StartControlsProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="hidden items-center gap-1.5 text-xs font-medium text-text-muted sm:inline-flex">
        <Icon name="clock" className="h-3.5 w-3.5 text-primary" />
        Phiên học:
      </span>
      <div
        role="group"
        aria-label="Chọn thời lượng học mục tiêu"
        className="inline-flex rounded-xl border border-border bg-surface-muted p-1"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={targetMinutes === opt.value}
            className={cn(
              "min-h-11 cursor-pointer rounded-lg px-4 text-sm font-semibold transition",
              targetMinutes === opt.value
                ? "bg-primary text-white shadow-xs"
                : "text-text-secondary hover:text-text"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
