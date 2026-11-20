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
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <CardHeader
          title="Tài khoản người học"
          className="flex-1 [&_h3]:text-base [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-slate-400"
        />
        {isAdmin && (
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-base font-semibold text-primary-dark no-underline transition hover:bg-teal-100"
          >
            <Icon name="shield" className="h-3.5 w-3.5" />
            Quản trị nội dung
          </Link>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-800">
            {profile?.displayName || "Bác sĩ Minh"}
          </div>
          <div className="mt-0.5 text-base text-slate-500">
            Múi giờ: {profile?.timezone || "Asia/Ho_Chi_Minh"}
          </div>
        </div>
        <Badge tone={isAdmin ? "info" : "neutral"}>
          {isAdmin ? "Quản trị viên (Admin)" : "Người học (Learner)"}
        </Badge>
      </div>
    </Card>
  );
}
