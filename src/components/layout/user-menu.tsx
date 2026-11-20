"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog, Icon, type IconName } from "@/components/ui";
import { useUserMenuNavigation } from "./use-user-menu-navigation";

export interface NavUser {
  displayName: string | null;
  /** role === "admin" → hiện mục Quản trị (spec §3.2). */
  isAdmin: boolean;
}

interface UserMenuProps {
  user: NavUser;
  /** "avatar" = nút tròn góc phải (mobile); "sidebar" = hàng đầy đủ cuối sidebar. */
  variant?: "avatar" | "sidebar";
  className?: string;
}

interface MenuEntry {
  href: string;
  label: string;
  icon: IconName;
}

const MENU_ENTRIES: MenuEntry[] = [
  { href: "/onboarding", label: "Thiết lập lộ trình", icon: "compass" },
  { href: "/settings", label: "Cài đặt", icon: "settings" },
];

function initials(name: string | null): string {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "M";
}

/**
 * Menu "Tôi" (spec §3.2): Cài đặt, Hồ sơ, Quản trị (chỉ admin), Đăng xuất.
 * Đóng khi bấm ra ngoài / ESC. Dropdown neo vào nút — cha đặt vị trí.
 */
export function UserMenu({ user, variant = "avatar", className }: UserMenuProps) {
  const router = useRouter();
  const { open, rootRef, triggerRef, menuRef, close, toggle, onTriggerKeyDown, onMenuKeyDown } = useUserMenuNavigation();
  const menuId = useId();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      setLogoutError(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      setLogoutError("Chưa đăng xuất được. Vui lòng thử lại.");
    }
  }

  const menuItems: MenuEntry[] = user.isAdmin
    ? [...MENU_ENTRIES, { href: "/admin", label: "Quản trị", icon: "shield" }]
    : MENU_ENTRIES;

  const avatarCircle = (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
      {initials(user.displayName)}
    </span>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
      {variant === "avatar" ? (
        <button
          type="button"
          ref={triggerRef}
          onClick={toggle}
          onKeyDown={onTriggerKeyDown}
          aria-label="Menu Tôi"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary-soft"
        >
          {avatarCircle}
        </button>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          onClick={toggle}
          onKeyDown={onTriggerKeyDown}
          aria-label="Menu Tôi"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
          className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:bg-surface-muted"
        >
          {avatarCircle}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold text-text" title={user.displayName || undefined}>
              {user.displayName || "Tài khoản của bạn"}
            </span>
            <span className="block text-xs text-text-muted">Tôi</span>
          </span>
          <Icon
            name="chevron-down"
            className={cn("h-4 w-4 text-text-muted transition-transform", open && "rotate-180")}
          />
        </button>
      )}

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Menu Tôi"
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute z-(--z-dropdown) w-60 max-w-[calc(100vw-2.5rem)] animate-fade-in rounded-xl border border-border bg-surface p-1.5 shadow-pop",
            variant === "avatar"
              ? "right-0 top-full mt-1.5"
              : "bottom-full left-0 mb-1.5"
          )}
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              tabIndex={-1}
              onClick={() => close()}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-base font-medium text-text-secondary no-underline transition-colors hover:bg-surface-subtle hover:text-text focus:bg-surface-subtle"
            >
              <Icon name={item.icon} className="h-4 w-4 text-slate-500" />
              {item.label}
            </Link>
          ))}

          <div aria-hidden="true" className="mx-2 my-1 border-t border-border" />

          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              close(true);
              setLogoutError(null);
              setConfirmingLogout(true);
            }}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-red-700 transition-colors hover:bg-red-50 focus:bg-red-50"
          >
            <Icon name="log-out" className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmingLogout}
        title="Đăng xuất khỏi hệ thống?"
        description={logoutError ? <span role="alert" className="text-red-700">{logoutError}</span> : "Bạn sẽ cần đăng nhập lại để tiếp tục học."}
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
        tone="danger"
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
