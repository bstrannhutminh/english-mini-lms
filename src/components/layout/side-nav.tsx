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
      className="fixed inset-y-0 left-0 z-(--z-nav) hidden w-(--sidebar-width) flex-col border-r border-border bg-surface px-3 py-6 shadow-xs lg:flex"
    >
      <div className="mb-7 px-3">
        <div className="mb-1 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-xs font-bold tracking-wider text-white shadow-xs">
            MD
          </div>
          <div>
            <p className="text-base font-bold leading-tight tracking-tight text-slate-900">
              English Mini LMS
            </p>
            <p className="text-[11px] font-semibold text-teal-700">
              Medical English Mastery
            </p>
          </div>
        </div>
        <p className="mt-2 pl-0.5 text-xs text-slate-500">
          BS. Minh • 30–45 phút mỗi ngày
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
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm no-underline transition-colors",
                active
                  ? "border-teal-200/70 bg-teal-50/80 font-bold text-teal-800 shadow-xs"
                  : "border-transparent font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                name={item.icon}
                className={cn("h-[22px] w-[22px]", active ? "text-teal-600" : "text-slate-500")}
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
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold leading-none text-white"
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
