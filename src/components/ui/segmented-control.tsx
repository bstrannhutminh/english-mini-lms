"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nhãn nhóm cho trình đọc màn hình. */
  ariaLabel: string;
  disabled?: boolean;
  /** Giãn đều hết chiều ngang (tab mobile). */
  fullWidth?: boolean;
  className?: string;
}

/**
 * Nhóm nút chọn một (aria-pressed) — dùng cho thời lượng 30/45 và công tắc
 * Đề bài/Bài làm. Vùng chạm ≥44px, chữ 16px.
 */
export function SegmentedControl<T extends string | number>({
  options, value, onChange, ariaLabel, disabled = false, fullWidth = false, className,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel}
      className={cn("items-center gap-1 rounded-xl bg-surface-subtle p-1", fullWidth ? "flex w-full" : "inline-flex w-fit", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button key={String(option.value)} type="button" disabled={disabled} aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-base font-medium disabled:cursor-not-allowed disabled:opacity-60",
              fullWidth && "flex-1",
              selected ? "bg-surface text-primary-dark shadow-card ring-1 ring-inset ring-border" : "text-text-secondary hover:text-text"
            )}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
