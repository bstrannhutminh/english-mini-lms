"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog, Icon, type IconName } from "@/components/ui";

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
  { href: "/settings", label: "Cài đặt", icon: "settings" },
  { href: "/onboarding", label: "Hồ sơ", icon: "user" },
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
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Đóng khi bấm ra ngoài hoặc ESC
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      setConfirmingLogout(false);
      // signOut lỗi rất hiếm; giữ người dùng ở lại và cho thử lại
    }
  }

  const menuItems: MenuEntry[] = user.isAdmin
    ? [...MENU_ENTRIES, { href: "/admin", label: "Quản trị", icon: "shield" }]
    : MENU_ENTRIES;

  const avatarCircle = (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-xs">
      {initials(user.displayName)}
    </span>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {variant === "avatar" ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu Tôi"
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-shadow hover:ring-2 hover:ring-teal-200"
        >
          {avatarCircle}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu Tôi"
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:bg-slate-50"
        >
          {avatarCircle}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-text">
              {user.displayName || "BS. Minh"}
            </span>
            <span className="block text-xs text-text-muted">Tôi</span>
          </span>
          <Icon
            name="chevron-down"
            className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
          />
        </button>
      )}

      {open ? (
        <div
          role="menu"
          aria-label="Menu Tôi"
          className={cn(
            "absolute z-(--z-dropdown) w-52 animate-fade-in rounded-xl border border-border bg-surface p-1.5 shadow-pop",
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
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name={item.icon} className="h-4 w-4 text-slate-500" />
              {item.label}
            </Link>
          ))}

          <div aria-hidden="true" className="mx-2 my-1 border-t border-border" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setConfirmingLogout(true);
            }}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            <Icon name="log-out" className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmingLogout}
        title="Đăng xuất khỏi hệ thống?"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục học."
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
