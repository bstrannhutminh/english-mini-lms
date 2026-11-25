"use client";

import { cn } from "@/lib/utils";
import { useRef, type KeyboardEvent, type ReactNode } from "react";

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

const ARROW_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

/**
 * Nhóm chọn MỘT giá trị theo pattern radiogroup (WAI-ARIA): role=radio +
 * aria-checked, roving tabindex (chỉ lựa chọn hiện tại nhận Tab), phím mũi
 * tên ←→↑↓ vừa chuyển focus vừa chọn — đúng kỳ vọng của trình đọc màn hình.
 * Dùng cho thời lượng 30/45, công tắc Đề bài/Bài làm, tab sau khi nộp.
 * Vùng chạm ≥44px, chữ 16px.
 */
export function SegmentedControl<T extends string | number>({
  options, value, onChange, ariaLabel, disabled = false, fullWidth = false, className,
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!ARROW_KEYS.includes(event.key)) return;
    event.preventDefault();
    const dir = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const next = (index + dir + options.length) % options.length;
    onChange(options[next].value);
    // Chuyển focus theo lựa chọn mới (roving tabindex cập nhật sau render,
    // nhưng focus cần đặt ngay để không mất dấu bàn phím).
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  }

  return (
    <div ref={groupRef} role="radiogroup" aria-label={ariaLabel}
      className={cn("items-center gap-1 rounded-xl bg-surface-subtle p-1", fullWidth ? "flex w-full" : "inline-flex w-fit", className)}>
      {options.map((option, index) => {
        const selected = option.value === value;
        // Không có lựa chọn nào khớp (dữ liệu lạ) → nút đầu nhận Tab thay.
        const tabbable = selectedIndex === -1 ? index === 0 : selected;
        return (
          <button key={String(option.value)} type="button" disabled={disabled}
            role="radio" aria-checked={selected}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
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
