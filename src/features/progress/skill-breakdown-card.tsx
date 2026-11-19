"use client";

/**
 * SkillBreakdownCard — phân bổ bài nộp theo 4 kỹ năng, tách Độc lập / Có hỗ
 * trợ (assisted do server tính từ session_events — chỉ đọc, không suy đoán).
 * Nhãn + icon lấy từ SKILL_INFO (lib/modes.ts — nguồn duy nhất).
 */
import { Icon } from "@/components/ui";
import { SKILL_INFO } from "@/lib/modes";
import type { ProgressSummaryContract } from "@/contracts/progress";

export interface SkillBreakdownCardProps {
  summary: ProgressSummaryContract;
}

export function SkillBreakdownCard({ summary }: SkillBreakdownCardProps) {
  return (
    <section
      data-tour="progress-chart"
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900">
          Phân bổ bài tập theo kỹ năng
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-500" />
            Độc lập
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded bg-amber-400" />
            Có hỗ trợ (gợi ý)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {summary.skillBreakdown.map((item) => {
          const info = SKILL_INFO[item.skill];
          const indepWidth =
            item.total > 0
              ? `${Math.round((item.independent / item.total) * 100)}%`
              : "0%";
          const assistWidth =
            item.total > 0
              ? `${Math.round((item.assisted / item.total) * 100)}%`
              : "0%";

          return (
            <div key={item.skill} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Icon
                    name={info.icon}
                    className={`h-3.5 w-3.5 ${info.iconClass}`}
                  />
                  <span>{info.shortLabel}</span>
                </span>
                <span className="font-medium text-slate-600">
                  {item.total} bài ({item.independent} độc lập, {item.assisted}{" "}
                  có hỗ trợ)
                </span>
              </div>

              {/* Thanh tỉ lệ 2 màu — style={{}} chỉ cho giá trị động */}
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                {item.total > 0 ? (
                  <>
                    <div
                      style={{ width: indepWidth }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Độc lập: ${item.independent}`}
                    />
                    <div
                      style={{ width: assistWidth }}
                      className="bg-amber-400 transition-all duration-300"
                      title={`Có hỗ trợ: ${item.assisted}`}
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-100" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
