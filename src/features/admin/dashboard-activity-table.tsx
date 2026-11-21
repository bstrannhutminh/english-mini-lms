"use client";

/**
 * Danh sách "Bài học trong hệ thống" — toàn bộ activity kèm trạng thái
 * kiểm duyệt (nhãn Việt), lọc theo REVIEW_STATES. Mobile (<sm): danh sách thẻ
 * dễ chạm thay vì bảng 5 cột phải cuộn ngang; từ sm trở lên: bảng.
 */
import Link from "next/link";
import { useState } from "react";
import { Badge, Card, CardHeader, Icon } from "@/components/ui";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import { modeMeta } from "@/lib/modes";
import { getTopicMeta } from "@/lib/topics";
import { inputCls } from "./form-bits";
import { REVIEW_STATE_OPTIONS } from "./labels";
import { StateBadge } from "./state-badge";

type ActivityItem = AdminDashboardDataContract["activities"][number];

function SkillBadges({ mode }: { mode: string }) {
  const meta = modeMeta(mode);
  return (
    <>
      <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
      {meta.isIelts && (
        <Badge tone="neutral" className="ml-1">
          IELTS
        </Badge>
      )}
    </>
  );
}

function TopicLabel({ topic }: { topic: string | null }) {
  const meta = getTopicMeta(topic);
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={meta.iconName} className="h-4 w-4 text-primary-dark" />
      {meta.name}
    </span>
  );
}

function ActivityCard({ act }: { act: ActivityItem }) {
  return (
    <li className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-semibold leading-snug text-text">{act.title}</p>
        <Link
          href={`/library/${act.id}`}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-end font-mono text-base text-primary-dark hover:underline"
        >
          {act.id}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <SkillBadges mode={act.mode} />
        <StateBadge state={act.reviewState} />
      </div>
      <p className="text-base text-text-secondary">
        <TopicLabel topic={act.topic} />
      </p>
    </li>
  );
}

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
    <Card elevated padded={false} className="p-4 sm:p-5">
      <CardHeader
        title={`Bài học trong hệ thống (${activities.length})`}
        description="Trạng thái kiểm duyệt của toàn bộ nội dung."
        action={
          <select
            aria-label="Lọc theo trạng thái"
            className={`${inputCls} !w-auto !min-h-11 !text-base`}
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

      {shown.length === 0 && (
        <p className="mt-4 rounded-xl border border-border py-6 text-center text-base italic text-text-muted">
          Không có bài nào khớp bộ lọc.
        </p>
      )}

      {shown.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border sm:hidden">
            {shown.map((act) => (
              <ActivityCard key={act.id} act={act} />
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border sm:block">
            <table className="w-full text-left text-base text-text-secondary">
              <thead className="border-b border-border bg-surface-muted font-semibold text-text-secondary">
                <tr>
                  <th className="px-3 py-2.5">Mã</th>
                  <th className="px-3 py-2.5">Tiêu đề</th>
                  <th className="px-3 py-2.5">Kỹ năng</th>
                  <th className="px-3 py-2.5">Chủ đề</th>
                  <th className="px-3 py-2.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map((act) => (
                  <tr key={act.id} className="hover:bg-surface-muted">
                    <td className="px-3 py-2.5 font-mono text-base text-text-muted">
                      <Link
                        href={`/library/${act.id}`}
                        className="inline-flex min-h-11 min-w-11 items-center hover:underline"
                      >
                        {act.id}
                      </Link>
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-2.5 font-medium text-text">
                      {act.title}
                    </td>
                    <td className="px-3 py-2.5">
                      <SkillBadges mode={act.mode} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <TopicLabel topic={act.topic} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StateBadge state={act.reviewState} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
