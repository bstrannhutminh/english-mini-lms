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
    "bg-primary text-white shadow-card hover:bg-primary-dark active:bg-teal-800 disabled:bg-surface-subtle disabled:text-text-muted disabled:shadow-none",
  secondary:
    "bg-text text-white hover:bg-slate-800 active:bg-slate-950 disabled:bg-surface-subtle disabled:text-text-muted",
  outline:
    "border border-border-strong bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text disabled:bg-surface-subtle disabled:text-text-muted",
  ghost:
    "text-text-secondary hover:bg-surface-subtle hover:text-text disabled:text-text-muted",
  danger:
    "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 disabled:bg-surface-subtle disabled:text-text-muted",
};

/**
 * Các cỡ nút đều giữ chữ 16px và điểm chạm ≥44px; "sm" giảm padding.
 */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-base rounded-lg",
  md: "min-h-11 px-4 text-base rounded-lg",
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
        "pressable inline-flex cursor-pointer items-center justify-center gap-2 font-medium select-none",
        "disabled:cursor-not-allowed",
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
