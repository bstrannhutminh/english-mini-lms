import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export interface EmptyStateProps {
  /** Tên icon trong icons.tsx (mặc định "info"). */
  icon?: IconName;
  title: string;
  description?: string;
  /** Nút hành động — truyền <Button> hoặc <Link> của caller. */
  action?: ReactNode;
  className?: string;
}

/**
 * Trạng thái trống thống nhất: icon tròn + tiêu đề + gợi ý tiếng Việt + 1 action.
 * Dùng cho danh sách rỗng, kết quả tìm kiếm trống, dữ liệu chưa có.
 */
export function EmptyState({
  icon = "info",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-surface px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-text">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
