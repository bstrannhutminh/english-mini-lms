/**
 * Bộ icon SVG nội bộ — quyết định D-1: không lucide/thư viện icon.
 * Glyph ở icon-paths.tsx (thu hoạch từ inline SVG trong codebase cũ).
 * Stroke "currentColor" → màu theo class text-* của cha. Icon là trang trí
 * (aria-hidden); nút chỉ có icon phải tự đặt aria-label.
 */
import { cn } from "@/lib/utils";
import { ICON_PATHS } from "./icon-paths";

export type { IconName } from "./icon-paths";
import type { IconName } from "./icon-paths";

export interface IconProps {
  name: IconName;
  /** Kích thước/màu — ví dụ "h-4 w-4 text-teal-600". Mặc định h-5 w-5. */
  className?: string;
  /** strokeWidth tùy chọn (mặc định 2). */
  strokeWidth?: number;
}

/** Icon dùng chung — `<Icon name="home" className="h-4 w-4" />`. */
export function Icon({ name, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5 shrink-0", className)}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
