import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ProgressRingProps {
  /** Giá trị hiện tại (0..max). */
  value: number;
  max?: number;
  /** Đường kính px. */
  size?: number;
  strokeWidth?: number;
  /** Nội dung giữa vòng (số, icon…). */
  children?: ReactNode;
  /** Mô tả cho trình đọc màn hình, ví dụ "2 trên 4 bước". */
  label: string;
  /** Lớp màu nét chính, mặc định teal. */
  toneClass?: string;
  className?: string;
}

/** Vòng tiến trình SVG thuần — không phụ thuộc thư viện, server/client đều dùng được. */
export function ProgressRing({
  value, max = 100, size = 56, strokeWidth = 6, children, label,
  toneClass = "text-primary", className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div role="img" aria-label={label} className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-slate-200" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)}
          className={cn("ring-progress-value", toneClass)} />
      </svg>
      {children ? <span className="absolute inset-0 flex items-center justify-center">{children}</span> : null}
    </div>
  );
}
