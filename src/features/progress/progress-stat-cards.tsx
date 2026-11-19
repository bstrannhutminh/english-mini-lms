"use client";

/**
 * ProgressStatCards — 4 chỉ số đầu trang Tiến độ: số phiên 7 ngày, phút thực
 * học (activeSeconds), tỉ lệ độc lập/có hỗ trợ, từ đã thuộc (mastery x/5).
 */
import type { ProgressSummaryContract } from "@/contracts/progress";

export interface ProgressStatCardsProps {
  summary: ProgressSummaryContract;
}

function StatCard({
  label,
  value,
  hint,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  hint: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <span className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </span>
      <div className={`mt-1 text-2xl font-black tabular-nums sm:text-3xl ${valueClass}`}>
        {value}
      </div>
      <span className="text-[11px] text-slate-500">{hint}</span>
    </div>
  );
}

export function ProgressStatCards({ summary }: ProgressStatCardsProps) {
  const totalSubs = summary.totalSubmissions || 0;
  const independentPct =
    totalSubs > 0
      ? Math.round((summary.independentCount / totalSubs) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard
        label="Phiên 7 ngày qua"
        value={String(summary.sessionsThisWeek)}
        hint="phiên học thực tế"
      />
      <StatCard
        label="Phút thực học"
        value={`${summary.actualStudyMinutes}′`}
        hint="tổng active time"
        valueClass="text-blue-600"
      />
      <StatCard
        label="Tự chủ / Độc lập"
        value={`${independentPct}%`}
        hint={`${summary.independentCount} độc lập / ${summary.assistedCount} có hỗ trợ`}
        valueClass="text-emerald-600"
      />
      <StatCard
        label="Từ đã thuộc"
        value={String(summary.masteredVocabCount)}
        hint={`trên ${summary.totalVocabCount} từ trong sổ`}
        valueClass="text-indigo-600"
      />
    </div>
  );
}
