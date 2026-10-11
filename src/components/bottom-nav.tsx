"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_ACTIVE = "#0d9488";
const ICON_IDLE = "#64748b";

const navItems = [
  {
    label: "Hôm nay",
    href: "/today",
    tour: "nav-today",
    icon: (stroke: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Thư viện",
    href: "/library",
    tour: "nav-library",
    icon: (stroke: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: "Bài của tôi",
    href: "/my-work",
    tour: "nav-my-work",
    icon: (stroke: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Sổ từ",
    href: "/vocab",
    tour: "nav-vocab",
    icon: (stroke: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: "Tiến độ",
    href: "/progress",
    tour: "nav-progress",
    icon: (stroke: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Thanh điều hướng dưới — tối ưu mobile (chiều cao 64px, touch target 44px+). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[var(--nav-height)] items-start border-t border-slate-200/80 bg-white/95 backdrop-blur-md pt-1.5 pb-[env(safe-area-inset-bottom,0px)] lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
    >
      {navItems.map((item) => {
        const active = isItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            data-tour={item.tour}
            aria-current={active ? "page" : undefined}
            className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-1 no-underline cursor-pointer group"
          >
            <div className="relative">
              {item.icon(active ? ICON_ACTIVE : ICON_IDLE)}
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-600" />
              )}
            </div>
            <span
              className={`text-[0.6875rem] leading-none tracking-tight ${
                active ? "font-bold text-teal-700" : "font-medium text-slate-500 group-hover:text-slate-800"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Sidebar trái — màn hình rộng (≥1024px). */
export function SideNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-slate-200/80 bg-white px-3 py-6 lg:flex shadow-xs"
    >
      <div className="mb-7 px-3">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
            MD
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              English Mini LMS
            </p>
            <p className="text-[11px] text-teal-700 font-semibold">
              Medical English Mastery
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 pl-0.5">
          BS. Minh • 30–45 phút mỗi ngày
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const active = isItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tour}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm no-underline transition-all cursor-pointer ${
                active
                  ? "bg-teal-50/80 font-bold text-teal-800 border border-teal-200/70 shadow-xs"
                  : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              {item.icon(active ? ICON_ACTIVE : ICON_IDLE)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
