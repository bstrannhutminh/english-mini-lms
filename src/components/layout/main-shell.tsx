"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppNav } from "./app-nav";
import { isFocusRoute } from "./focus-routes";
import type { NavUser } from "./user-menu";

export interface MainShellProps {
  vocabDueCount: number;
  user: NavUser;
  children: ReactNode;
}

/**
 * Khung chính của nhóm route `(main)`.
 * - Route thông thường: hiển thị AppNav (sidebar desktop + top/bottom bar mobile).
 * - Route Tập trung (`/learn/*`, `/onboarding`): ẩn toàn bộ chrome điều hướng
 *   để người học tập trung tối đa và không bị che nút hành động ở đáy màn hình.
 */
export function MainShell({ vocabDueCount, user, children }: MainShellProps) {
  const pathname = usePathname();
  const focusMode = isFocusRoute(pathname);

  if (focusMode) {
    return (
      <div className="flex min-h-dvh flex-col bg-surface-muted">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <AppNav vocabDueCount={vocabDueCount} user={user} />
      <main className="flex-1 pb-(--nav-height) pt-(--topbar-height) lg:pb-0 lg:pl-(--sidebar-width) lg:pt-0">
        {children}
      </main>
    </div>
  );
}
