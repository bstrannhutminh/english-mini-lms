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
 * Trạng thái trống thống nhất: tiêu đề, gợi ý tiếng Việt và một action.
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
        "flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-muted px-6 py-10 text-center",
        className
      )}
    >
      <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center text-text-muted">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-text">{title}</p>
        {description ? (
          <p className="mx-auto max-w-md text-base leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
