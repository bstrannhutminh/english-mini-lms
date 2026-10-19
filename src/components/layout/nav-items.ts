import type { IconName } from "@/components/ui/icons";

/**
 * 5 tab chính của IA (spec §3.2). `tour` = data-tour cho guided tour —
 * KHÔNG đổi nếu không cập nhật cả src/components/tour-steps.ts.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  tour: string;
  /** Tab gắn badge số từ đến hạn (chỉ "Sổ từ"). */
  showsVocabDueBadge: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Hôm nay", icon: "home", tour: "nav-today", showsVocabDueBadge: false },
  { href: "/library", label: "Thư viện", icon: "book", tour: "nav-library", showsVocabDueBadge: false },
  { href: "/my-work", label: "Bài của tôi", icon: "file-text", tour: "nav-my-work", showsVocabDueBadge: false },
  { href: "/vocab", label: "Sổ từ", icon: "pen", tour: "nav-vocab", showsVocabDueBadge: true },
  { href: "/progress", label: "Tiến độ", icon: "bar-chart", tour: "nav-progress", showsVocabDueBadge: false },
];

/** Tab đang hoạt động khi pathname = href hoặc nằm dưới href/. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Đếm → chuỗi badge (99+ khi quá lớn). */
export function formatBadgeCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}
