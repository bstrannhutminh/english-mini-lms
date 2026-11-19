import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Bỏ padding mặc định khi cần tự chia vùng (media, bảng…). */
  padded?: boolean;
  /** Thẻ bấm được: hover nhấn + con trỏ (dùng kèm role/tabIndex của caller). */
  interactive?: boolean;
}

/** Khung thẻ chuẩn: nền trắng, viền slate, bo 16px, shadow-card. */
export function Card({
  padded = true,
  interactive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-card",
        padded && "p-5",
        interactive &&
          "cursor-pointer transition-shadow hover:shadow-md hover:border-slate-300",
        className
      )}
      {...rest}
    />
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Nút/link nhỏ đặt bên phải tiêu đề. */
  action?: ReactNode;
  className?: string;
}

/** Hàng tiêu đề thẻ — tự giãn khi có action. */
export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0 space-y-1">
        <h3 className="text-base font-semibold leading-snug text-text">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
