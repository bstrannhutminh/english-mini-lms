"use client";

/**
 * QuickLinks — 2 ô điều hướng nhanh cuối trang Hôm nay: Tiến độ + Sổ từ.
 */
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";

const LINKS: Array<{
  href: string;
  title: string;
  description: string;
  icon: IconName;
  iconClass: string;
}> = [
  {
    href: "/progress",
    title: "Tiến độ học tập",
    description: "Phút thực học, chuỗi ngày, lỗi lặp & so sánh",
    icon: "bar-chart",
    iconClass: "bg-teal-50 text-teal-700 border-teal-100 group-hover:text-teal-700",
  },
  {
    href: "/vocab",
    title: "Sổ từ vựng y khoa",
    description: "Từ đã lưu & ôn tập ngắt quãng Spaced Repetition",
    icon: "cards",
    iconClass:
      "bg-indigo-50 text-indigo-700 border-indigo-100 group-hover:text-indigo-700",
  },
];

export function QuickLinks() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm sm:p-5"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${link.iconClass}`}
          >
            <Icon name={link.icon} className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 transition group-hover:text-teal-700">
              {link.title}
            </h4>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {link.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
