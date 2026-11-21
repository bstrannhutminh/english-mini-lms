"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui";
import { UserMenu, type NavUser } from "./user-menu";
import { NAV_ITEMS, formatBadgeCount, isNavItemActive } from "./nav-items";

interface SideNavProps {
  vocabDueCount?: number;
  user: NavUser;
}

/**
 * Sidebar trái cho desktop (≥lg). Rộng var(--sidebar-width) — layout chừa
 * chỗ bằng lg:pl-(--sidebar-width). Menu "Tôi" nằm cuối sidebar (spec §3.2).
 */
export function SideNav({ vocabDueCount = 0, user }: SideNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-y-0 left-0 z-(--z-nav) hidden w-(--sidebar-width) flex-col border-r border-border bg-surface px-3 py-6 lg:flex"
    >
      <div className="mb-8 px-3">
        <div className="mb-1 flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold tracking-wide text-white">
            MD
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight tracking-tight text-text">
              English Mini LMS
            </p>
          </div>
        </div>
        <p className="mt-3 text-base leading-relaxed text-text-muted">
          30–45 phút mỗi ngày
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const showBadge = item.showsVocabDueBadge && vocabDueCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tour}
              aria-current={active ? "page" : undefined}
              className={cn(
                "pressable flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-base no-underline",
                active
                  ? "border-transparent bg-primary-soft font-semibold text-primary-dark"
                  : "border-transparent font-medium text-text-secondary hover:bg-surface-muted hover:text-text"
              )}
            >
              <Icon
                name={item.icon}
                className={cn("h-5 w-5", active ? "text-primary" : "text-text-muted")}
              />
              <span className="flex-1">
                {item.label}
                {showBadge ? (
                  <span className="sr-only">, {vocabDueCount} từ đến hạn</span>
                ) : null}
              </span>
              {showBadge ? (
                <span
                  aria-hidden="true"
                  className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold leading-none text-white"
                >
                  {formatBadgeCount(vocabDueCount)}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Menu "Tôi" — cuối sidebar */}
      <div className="mt-4 border-t border-border pt-3">
        <UserMenu user={user} variant="sidebar" />
      </div>
    </nav>
  );
}
