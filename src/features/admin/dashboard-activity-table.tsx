"use client";

/**
 * Bảng "Bài học trong hệ thống" — toàn bộ activity kèm trạng thái
 * kiểm duyệt (nhãn Việt), lọc theo REVIEW_STATES.
 */
import Link from "next/link";
import { useState } from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import { modeMeta } from "@/lib/modes";
import { getTopicMeta } from "@/lib/topics";
import { inputCls } from "./form-bits";
import { REVIEW_STATE_OPTIONS } from "./labels";
import { StateBadge } from "./state-badge";

export function DashboardActivityTable({
  activities,
}: {
  activities: AdminDashboardDataContract["activities"];
}) {
  const [stateFilter, setStateFilter] = useState("all");
  const shown =
    stateFilter === "all"
      ? activities
      : activities.filter((a) => a.reviewState === stateFilter);

  return (
    <Card padded={false} className="p-4 sm:p-5">
      <CardHeader
        title={`Bài học trong hệ thống (${activities.length})`}
        description="Trạng thái kiểm duyệt của toàn bộ nội dung."
        action={
          <select
            aria-label="Lọc theo trạng thái"
            className={`${inputCls} !w-auto !min-h-9 text-xs`}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {REVIEW_STATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        }
      />
      <div className="mt-4 overflow-x-auto border rounded-lg">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
            <tr>
              <th className="py-2.5 px-3">Mã</th>
              <th className="py-2.5 px-3">Tiêu đề</th>
              <th className="py-2.5 px-3">Kỹ năng</th>
              <th className="py-2.5 px-3">Chủ đề</th>
              <th className="py-2.5 px-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                  Không có bài nào khớp bộ lọc.
                </td>
              </tr>
            ) : (
              shown.map((act) => {
                const meta = modeMeta(act.mode);
                const topic = getTopicMeta(act.topic);
                return (
                  <tr key={act.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      <Link href={`/library/${act.id}`} className="hover:underline">
                        {act.id}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[220px] truncate">
                      {act.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
                      {meta.isIelts && (
                        <Badge tone="neutral" className="ml-1">
                          IELTS
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {topic.icon} {topic.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <StateBadge state={act.reviewState} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
