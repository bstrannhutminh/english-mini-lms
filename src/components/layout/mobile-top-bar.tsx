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
    <header className="fixed inset-x-0 top-0 z-(--z-nav) flex h-(--topbar-height) items-center justify-between border-b border-border bg-surface px-5 pt-[env(safe-area-inset-top,0px)] lg:hidden">
      <Link
        href="/today"
        aria-label="English Mini LMS — về Hôm nay"
        className="flex min-h-11 items-center gap-2 no-underline"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold tracking-wide text-white">
          MD
        </span>
        <span className="text-base font-semibold tracking-tight text-text">
          English Mini LMS
        </span>
      </Link>
      <UserMenu user={user} variant="avatar" />
    </header>
  );
}
