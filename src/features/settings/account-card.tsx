"use client";

import Link from "next/link";
import { Badge, Card, CardHeader, Icon } from "@/components/ui";
import type { LearnerProfile } from "@/contracts/settings";

/** Thẻ thông tin tài khoản: tên, múi giờ, vai trò + link Quản trị nếu admin. */
export function AccountCard({ profile }: { profile: LearnerProfile | null }) {
  if (!profile) {
    return <Card><CardHeader title="Tài khoản người học" description="Chưa tải được thông tin tài khoản. Thử tải lại trang để xem đúng hồ sơ của bạn." /></Card>;
  }
  const isAdmin = profile?.role === "admin";
  const displayName = profile?.displayName || "Bác sĩ Minh";
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
          {displayName.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 break-words text-base font-semibold leading-snug text-text">{displayName}</h3>
            <Badge tone={isAdmin ? "info" : "neutral"} className="px-2 py-0.5">
              {isAdmin ? "Quản trị viên" : "Người học"}
            </Badge>
          </div>
          <p className="break-words text-sm text-text-muted">
            Múi giờ: {profile?.timezone || "Asia/Ho_Chi_Minh"}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Link
          href="/admin"
          className="pressable flex min-h-12 items-center gap-2 rounded-xl bg-surface-muted px-4 text-base font-medium text-primary-dark no-underline hover:bg-primary-soft"
        >
          <Icon name="shield" className="h-4 w-4 shrink-0" />
          <span className="flex-1">Quản trị nội dung</span>
          <Icon name="chevron-right" className="h-4 w-4 shrink-0" />
        </Link>
      )}
    </Card>
  );
}
