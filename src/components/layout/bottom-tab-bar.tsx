"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui";
import { NAV_ITEMS, formatBadgeCount, isNavItemActive } from "./nav-items";

interface BottomTabBarProps {
  /** Số từ đến hạn — badge đỏ trên tab "Sổ từ" (0 = ẩn). */
  vocabDueCount?: number;
}

/**
 * Thanh tab dưới cho mobile (<lg). Cao --nav-height (64px + safe-area),
 * mọi mục ≥44px. Giữ data-tour cho guided tour.
 */
export function BottomTabBar({ vocabDueCount = 0 }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-(--z-nav) flex h-(--nav-height) items-stretch border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] pt-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] backdrop-blur-md lg:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const showBadge = item.showsVocabDueBadge && vocabDueCount > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-tour={item.tour}
            aria-current={active ? "page" : undefined}
            className="group flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1 no-underline"
          >
            <span className="relative">
              <Icon
                name={item.icon}
                className={cn(
                  "h-[22px] w-[22px]",
                  active ? "text-teal-600" : "text-slate-500 group-hover:text-slate-700"
                )}
              />
              {showBadge ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white"
                >
                  {formatBadgeCount(vocabDueCount)}
                </span>
              ) : null}
              {active && !showBadge ? (
                <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-teal-600" />
              ) : null}
            </span>
            <span
              className={cn(
                "text-[0.6875rem] leading-none tracking-tight",
                active
                  ? "font-bold text-teal-700"
                  : "font-medium text-slate-500 group-hover:text-slate-800"
              )}
            >
              {item.label}
              {showBadge ? (
                <span className="sr-only">, {vocabDueCount} từ đến hạn</span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
