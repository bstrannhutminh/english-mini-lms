"use client";

import { cn } from "@/lib/utils";
import { useRef, type KeyboardEvent } from "react";
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;
    else return;
    e.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onValueChange(tabs[nextIndex].value);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        variant === "underline"
          ? "flex flex-wrap gap-1 border-b border-border"
          : "inline-flex flex-wrap gap-1 rounded-xl bg-surface-subtle p-1",
        className
      )}
    >
      {tabs.map((tab, index) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            ref={(node) => { tabRefs.current[index] = node; }}
            role="tab"
            aria-selected={active}
            tabIndex={active || (!tabs.some((item) => item.value === value) && index === 0) ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-medium transition-colors",
              variant === "underline"
                ? cn(
                    "-mb-px border-b-2 px-3 text-base",
                    active
                      ? "border-primary text-teal-800"
                      : "border-transparent text-text-secondary hover:text-text"
                  )
                : cn(
                    "rounded-lg px-3.5 text-base",
                    active
                      ? "bg-surface text-primary-dark"
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
