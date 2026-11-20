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
 * Thanh tab dưới cho mobile (<lg). Cao --nav-height (80px + safe-area),
 * mọi mục ≥44px. Giữ data-tour cho guided tour.
 */
export function BottomTabBar({ vocabDueCount = 0 }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-(--z-nav) grid h-(--nav-height) grid-cols-5 items-stretch border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
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
            className={cn("group flex min-h-11 min-w-0 cursor-pointer flex-col items-center justify-center gap-2 border-t-2 py-2 no-underline", active ? "border-primary bg-surface-muted" : "border-transparent")}
          >
            <span className="relative">
              <Icon
                name={item.icon}
                className={cn(
                  "h-5 w-5",
                  active ? "text-primary" : "text-text-muted group-hover:text-text"
                )}
              />
              {showBadge ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold leading-none text-white"
                >
                  {formatBadgeCount(vocabDueCount)}
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-base leading-none tracking-[-0.035em]",
                active
                  ? "font-semibold text-primary-dark"
                  : "font-normal text-text-muted group-hover:text-text"
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
