import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Dòng phụ dưới con số. */
  hint?: ReactNode;
  icon?: IconName;
  /** Lớp màu cho ô icon, mặc định teal nhạt. */
  iconClass?: string;
  /** Ẩn ô icon trên mobile (<sm) để nhường chỗ cho con số. */
  hideIconOnMobile?: boolean;
  className?: string;
}

/** Ô số liệu gọn: icon + nhãn + con số lớn — dùng ở Hôm nay và Tiến độ. */
export function StatTile({ label, value, hint, icon, iconClass = "bg-primary-soft text-primary-dark", hideIconOnMobile = false, className }: StatTileProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {icon && (
        <span aria-hidden="true" className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", hideIconOnMobile && "max-sm:hidden", iconClass)}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm leading-5 text-text-muted">{label}</p>
        <p className="text-xl font-semibold leading-7 tabular-nums tracking-tight text-text">{value}</p>
        {hint ? <p className="text-sm leading-5 text-text-secondary">{hint}</p> : null}
      </div>
    </div>
  );
}
