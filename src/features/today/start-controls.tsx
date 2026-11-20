"use client";
import { cn } from "@/lib/utils";
export interface StartControlsProps {
  targetMinutes: 30 | 45;
  onSelect: (mins: 30 | 45) => void;
  disabled?: boolean;
}
const OPTIONS: Array<{
  value: 30 | 45;
  label: string;
}> = [
    { value: 30, label: "30 phút" },
    { value: 45, label: "45 phút" },
  ];
/** Bộ chọn thời lượng 30'/45' gọn gàng đặt ngay trong đầu trang Hôm nay. */
export function StartControls({ targetMinutes, onSelect, disabled = false }: StartControlsProps) {
  return (<div className="flex items-center gap-2.5">

    <div role="group" aria-label="Chọn thời lượng học mục tiêu" className="inline-flex rounded-xl border border-border bg-surface p-1">

      {OPTIONS.map((opt) => (<button key={opt.value} type="button" disabled={disabled} onClick={() => onSelect(opt.value)} aria-pressed={targetMinutes === opt.value} className={cn("min-h-11 cursor-pointer rounded-lg px-4 text-base font-medium transition disabled:cursor-not-allowed disabled:opacity-60", targetMinutes === opt.value
        ? "bg-primary text-white"
        : "text-text-secondary hover:text-text")}>

        {opt.label}

      </button>))}

    </div>

  </div>);
}
