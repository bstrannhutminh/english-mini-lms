import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white shadow-xs hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300",
  secondary:
    "bg-slate-900 text-white shadow-xs hover:bg-slate-800 active:bg-black disabled:bg-slate-300",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 disabled:bg-slate-50",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400",
  danger:
    "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 disabled:bg-slate-300",
};

/**
 * "sm" chỉ dành cho toolbar desktop chật — mọi điểm chạm chính phải ≥44px
 * (md/lg/icon). Xem rule a11y trong kien-truc-tai-cau-truc-2026-10-19.md §4.7.
 */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm rounded-lg",
  md: "min-h-11 px-4 text-sm rounded-xl",
  lg: "min-h-12 px-5 text-base rounded-xl",
  icon: "h-11 w-11 p-0 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Hiển thị Spinner + vô hiệu hoá nút trong lúc chờ. */
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Nút chuẩn của hệ thống. Server/client đều dùng được; props HTML chuẩn
 * (onClick, type, disabled…) truyền thẳng xuống <button>.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors select-none",
        "disabled:cursor-not-allowed disabled:opacity-70",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" label="Đang xử lý" /> : null}
      {children}
    </button>
  );
}
