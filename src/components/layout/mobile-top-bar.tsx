"use client";

import Link from "next/link";
import { UserMenu, type NavUser } from "./user-menu";

interface MobileTopBarProps {
  user: NavUser;
}

/**
 * Thanh trên cho mobile (<lg): nhận diện app trái, avatar "Tôi" góc phải
 * (spec §3.2). Cố định trên cùng; layout chừa chỗ bằng pt-14.
 */
export function MobileTopBar({ user }: MobileTopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-(--z-nav) flex h-(--topbar-height) items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md lg:hidden">
      <Link
        href="/today"
        aria-label="English Mini LMS — về Hôm nay"
        className="flex items-center gap-2 no-underline"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-[10px] font-bold tracking-wider text-white">
          MD
        </span>
        <span className="text-sm font-bold tracking-tight text-slate-900">
          English Mini LMS
        </span>
      </Link>
      <UserMenu user={user} variant="avatar" />
    </header>
  );
}
