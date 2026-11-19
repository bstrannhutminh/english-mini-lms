"use client";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icons";

export interface TabItem {
  value: string;
  label: string;
  /** Số nhỏ cạnh nhãn (vd. số từ đến hạn). */
  count?: number;
  icon?: IconName;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** "underline" cho tab trang, "pills" cho bộ lọc nhỏ. */
  variant?: "underline" | "pills";
  "aria-label": string;
  className?: string;
}

/**
 * Hàng tab điều khiển (controlled). Component chỉ render phần tablist —
 * nội dung panel do caller render theo `value` để giữ file nhỏ và linh hoạt.
 * Hỗ trợ phím ← → theo pattern tablist của WAI-ARIA.
 */
export function Tabs({
  tabs,
  value,
  onValueChange,
  variant = "underline",
  "aria-label": ariaLabel,
  className,
}: TabsProps) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const index = tabs.findIndex((t) => t.value === value);
    if (index === -1) return;
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    onValueChange(next.value);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        variant === "underline"
          ? "flex gap-1 border-b border-border"
          : "inline-flex gap-1 rounded-xl bg-slate-100 p-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-medium transition-colors",
              variant === "underline"
                ? cn(
                    "-mb-px border-b-2 px-3 text-sm",
                    active
                      ? "border-primary text-teal-800"
                      : "border-transparent text-text-secondary hover:text-text"
                  )
                : cn(
                    "rounded-lg px-3.5 text-sm",
                    active
                      ? "bg-surface text-text shadow-xs"
                      : "text-text-secondary hover:text-text"
                  )
            )}
          >
            {tab.icon ? <Icon name={tab.icon} className="h-4 w-4" /> : null}
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] font-semibold leading-4 tabular-nums",
                  active ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
