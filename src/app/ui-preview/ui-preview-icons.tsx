"use client";

import { Icon, type IconName } from "@/components/ui";

/** Toàn bộ icon trong bộ nội bộ — cập nhật khi thêm icon vào icon-paths.tsx. */
const ALL_ICONS: IconName[] = [
  "home", "book", "file-text", "pen", "bar-chart",
  "pen-tool", "book-open", "mic", "headphones",
  "flame", "play", "pause", "clock", "refresh", "sparkles", "cards",
  "compass", "calendar", "bookmark", "save", "check", "check-circle",
  "x", "alert-triangle", "info", "flag",
  "user", "settings", "shield", "log-out",
  "chevron-down", "chevron-left", "chevron-right", "arrow-left", "arrow-right",
  "plus", "search", "trash", "external-link", "eye", "eye-off",
];

/** Lưới icon — mục "Icons" của trang /ui-preview. */
export function IconGallery() {
  return (
    <div className="grid grid-cols-6 gap-3 sm:grid-cols-10">
      {ALL_ICONS.map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface p-2"
        >
          <Icon name={name} className="h-5 w-5 text-slate-600" />
          <span className="text-[9px] text-text-muted">{name}</span>
        </div>
      ))}
    </div>
  );
}
