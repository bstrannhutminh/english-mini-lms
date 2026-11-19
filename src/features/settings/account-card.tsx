"use client";

import Link from "next/link";
import { Badge, Card, CardHeader } from "@/components/ui";
import type { LearnerProfile } from "@/contracts/settings";

/** Thẻ thông tin tài khoản: tên, múi giờ, vai trò + link Quản trị nếu admin. */
export function AccountCard({ profile }: { profile: LearnerProfile | null }) {
  const isAdmin = profile?.role === "admin";
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <CardHeader
          title="Tài khoản người học"
          className="flex-1 [&_h3]:text-sm [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-slate-400"
        />
        {isAdmin && (
          <Link
            href="/admin"
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Quản trị (Admin) 🛠️
          </Link>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-800">
            {profile?.displayName || "Bác sĩ Minh"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
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
