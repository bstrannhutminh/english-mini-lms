import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Một nhóm cài đặt: cột trái là icon + tiêu đề + mô tả, cột phải là các thẻ.
 * `tone="danger"` dùng cho vùng thao tác cần cẩn trọng (xoá bài, đăng xuất).
 */
export function SettingsSection({ title, description, icon, tone = "default", children }: {
  title: string;
  description: string;
  icon: IconName;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <section className={cn("grid gap-4 border-t pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8", danger ? "border-red-200" : "border-border")}>
      <header className="flex min-w-0 items-start gap-3 lg:pr-6">
        <span aria-hidden="true" className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", danger ? "bg-red-50 text-red-700" : "bg-primary-soft text-primary-dark")}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <h2 className={cn("text-lg font-semibold leading-snug", danger ? "text-red-800" : "text-text")}>{title}</h2>
          <p className="text-base leading-relaxed text-text-secondary">{description}</p>
        </div>
      </header>
      <div className="min-w-0 space-y-3 sm:space-y-4">{children}</div>
    </section>
  );
}
