import { Card, StatTile } from "@/components/ui";
import type { ProgressSummaryContract } from "@/contracts/progress";

export interface ProgressStatCardsProps {
  summary: ProgressSummaryContract;
}

/** Trên mobile (2 cột hẹp) icon nằm trên chữ để nhãn không bị gãy dòng. */
const TILE_LAYOUT = "max-sm:flex-col max-sm:items-start max-sm:gap-2.5";

/** Hàng 4 ô số liệu bằng chứng: phiên 7 ngày, phút thực học, tỉ lệ độc lập, từ đã thuộc. */
export function ProgressStatCards({ summary }: ProgressStatCardsProps) {
  const totalSubs = summary.totalSubmissions || 0;
  const independentPct =
    totalSubs > 0 ? Math.round((summary.independentCount / totalSubs) * 100) : null;

  return (
    <div role="group" aria-label="Tổng quan tiến độ" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Card padded={false} className="p-4 sm:p-5">
        <StatTile
          icon="calendar"
          label="Phiên 7 ngày qua"
          value={summary.sessionsThisWeek}
          hint="phiên học"
          className={TILE_LAYOUT}
        />
      </Card>
      <Card padded={false} className="p-4 sm:p-5">
        <StatTile
          icon="clock"
          iconClass="bg-sky-50 text-sky-700"
          label="Phút thực học"
          value={summary.actualStudyMinutes}
          hint="phút tập trung"
          className={TILE_LAYOUT}
        />
      </Card>
      <Card padded={false} className="p-4 sm:p-5">
        <StatTile
          icon="check-circle"
          iconClass="bg-emerald-50 text-emerald-700"
          label="Tự làm độc lập"
          value={independentPct === null ? "—" : `${independentPct}%`}
          hint={
            totalSubs > 0
              ? `${summary.independentCount}/${totalSubs} bài nộp`
              : "chưa có bài nộp"
          }
          className={TILE_LAYOUT}
        />
      </Card>
      <Card padded={false} className="p-4 sm:p-5">
        <StatTile
          icon="bookmark"
          iconClass="bg-amber-50 text-amber-700"
          label="Từ đã thuộc"
          value={summary.masteredVocabCount}
          hint={`trên ${summary.totalVocabCount} từ trong sổ`}
          className={TILE_LAYOUT}
        />
      </Card>
    </div>
  );
}
