import Link from "next/link";
import { Icon, MeterBar, SkillTile } from "@/components/ui";
import { SKILL_INFO } from "@/lib/modes";
import type { ProgressSummaryContract, SkillCountContract } from "@/contracts/progress";

export interface SkillBreakdownCardProps {
  summary: ProgressSummaryContract;
}

function SkillRow({ item }: { item: SkillCountContract }) {
  const info = SKILL_INFO[item.skill];
  const independentPct = item.total > 0 ? (item.independent / item.total) * 100 : 0;
  const assistedPct = item.total > 0 ? (item.assisted / item.total) * 100 : 0;

  return (
    <li className="flex items-start gap-3.5 py-4">
      <SkillTile mode={item.skill} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-semibold text-text">{info.shortLabel}</span>
          <span className="shrink-0 text-base tabular-nums text-text-secondary">
            <span className="text-lg font-semibold text-text">{item.total}</span> bài
          </span>
        </div>
        <MeterBar percent={independentPct} secondaryPercent={assistedPct} className="mt-2 h-2" />
        <p className="mt-1.5 text-sm leading-6 text-text-secondary">
          {item.total > 0
            ? `${item.independent} tự làm độc lập · ${item.assisted} có hỗ trợ`
            : "Chưa có bài nộp cho kỹ năng này"}
        </p>
      </div>
    </li>
  );
}

/** Số bài đã nộp theo 4 kỹ năng — là bằng chứng luyện tập, không phải điểm hay band ước tính. */
export function SkillBreakdownCard({ summary }: SkillBreakdownCardProps) {
  return (
    <section data-tour="progress-chart" aria-labelledby="skill-breakdown-title" className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 id="skill-breakdown-title" className="text-lg font-semibold text-text">Bốn kỹ năng, từng lần luyện</h2>
          <p className="mt-0.5 text-base text-text-secondary">Số bài đã nộp, tách riêng tự làm và có hỗ trợ.</p>
        </div>
        <Link href="/library" className="pressable -mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-base font-medium text-primary-dark hover:bg-primary-soft">
          Luyện thêm
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-2 grid divide-y divide-border sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0">
        {summary.skillBreakdown.map((item) => (
          <SkillRow key={item.skill} item={item} />
        ))}
      </ul>

      <p className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-3 text-sm text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-primary" />
          Tự làm độc lập
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          Có hỗ trợ (đã xem gợi ý trước khi nộp)
        </span>
      </p>
    </section>
  );
}
