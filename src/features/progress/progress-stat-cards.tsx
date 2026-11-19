"use client";

import { Icon, type IconName } from "@/components/ui";
import type { ProgressSummaryContract } from "@/contracts/progress";

export interface ProgressStatCardsProps {
  summary: ProgressSummaryContract;
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accentClass = "text-text",
}: {
  icon: IconName;
  label: string;
  value: string;
  hint: string;
  accentClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <Icon name={icon} className="h-4 w-4 text-primary/80" />
      </div>
      <div
        className={`mt-1.5 text-2xl font-extrabold tabular-nums sm:text-3xl ${accentClass}`}
      >
        {value}
      </div>
      <span className="text-xs text-text-secondary">{hint}</span>
    </div>
  );
}

/** 4 thẻ chỉ số tiến độ đồng bộ bảng màu Medical Clean (Teal/Slate/Emerald). */
export function ProgressStatCards({ summary }: ProgressStatCardsProps) {
  const totalSubs = summary.totalSubmissions || 0;
  const independentPct =
    totalSubs > 0
      ? Math.round((summary.independentCount / totalSubs) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard
        icon="calendar"
        label="Phiên 7 ngày qua"
        value={String(summary.sessionsThisWeek)}
        hint="phiên học thực tế"
      />
      <StatCard
        icon="clock"
        label="Phút thực học"
        value={`${summary.actualStudyMinutes}′`}
        hint="tổng thời gian tập trung"
        accentClass="text-primary-dark"
      />
      <StatCard
        icon="check-circle"
        label="Tự làm độc lập"
        value={`${independentPct}%`}
        hint={`${summary.independentCount} độc lập · ${summary.assistedCount} có hỗ trợ`}
        accentClass="text-emerald-700"
      />
      <StatCard
        icon="bookmark"
        label="Từ đã thuộc"
        value={String(summary.masteredVocabCount)}
        hint={`trên ${summary.totalVocabCount} từ trong sổ`}
      />
    </div>
  );
}
