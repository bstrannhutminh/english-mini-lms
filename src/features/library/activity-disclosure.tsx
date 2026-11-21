import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui";

/** Mục mở rộng dạng thẻ (details/summary) trên trang chi tiết bài học. */
export function ActivityDisclosure({ icon, title, defaultOpen = false, children }: {
  icon: IconName;
  title: string;
  /** Mở sẵn khi tải trang (người học vẫn tự đóng được). */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-border bg-surface">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-3 text-base font-medium text-text [&::-webkit-details-marker]:hidden">
        <Icon name={icon} className="h-5 w-5 shrink-0 text-text-muted" />
        <span className="min-w-0 flex-1 break-words">{title}</span>
        <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180" />
      </summary>
      <div className="max-w-prose space-y-3 px-5 pb-5 text-base leading-relaxed text-text-secondary">{children}</div>
    </details>
  );
}
