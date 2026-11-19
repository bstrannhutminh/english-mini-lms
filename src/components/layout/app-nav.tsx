"use client";

import { BottomTabBar } from "./bottom-tab-bar";
import { MobileTopBar } from "./mobile-top-bar";
import { SideNav } from "./side-nav";
import type { NavUser } from "./user-menu";

export interface AppNavProps {
  /** Số từ đến hạn — badge trên tab "Sổ từ". Layout truyền từ server; 0 = ẩn. */
  vocabDueCount?: number;
  user: NavUser;
}

/**
 * Khung điều hướng của app: sidebar desktop + (top bar + bottom tab) mobile.
 * Render ở (main)/layout một lần duy nhất.
 */
export function AppNav({ vocabDueCount = 0, user }: AppNavProps) {
  return (
    <>
      <SideNav vocabDueCount={vocabDueCount} user={user} />
      <MobileTopBar user={user} />
      <BottomTabBar vocabDueCount={vocabDueCount} />
    </>
  );
}
