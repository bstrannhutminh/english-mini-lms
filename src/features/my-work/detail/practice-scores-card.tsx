import { Icon, MeterBar } from "@/components/ui";
import { scoreCriterionLabel } from "@/lib/feedback-labels";
import type { PracticeScore } from "@/contracts/submission";
import { formatScore, practiceScaleMax } from "./practice-estimate";

interface PracticeScoresCardProps {
  scores: PracticeScore[];
  /** Giới hạn của nhận xét — invariant: luôn hiện trên trang, không ẩn sau click. */
  limitations: string;
}

/** Ghi chú giới hạn đánh giá của AI (luôn hiển thị). */
function LimitationsNote({ limitations }: { limitations: string }) {
  return (
    <p className="flex items-start gap-2.5 rounded-xl bg-surface-muted px-4 py-3 text-base leading-relaxed text-text-secondary">
      <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-text-muted" />
      <span className="min-w-0">
        <span className="font-semibold text-text">Giới hạn của nhận xét: </span>
        {limitations}
      </span>
    </p>
  );
}

/**
 * Điểm ƯỚC TÍNH LUYỆN TẬP theo từng tiêu chí (kind = practice_estimate —
 * không phải band chính thức): nhãn tiếng Việt, giá trị, thanh mảnh, lý do.
 * Không có điểm → chỉ còn ghi chú giới hạn.
 */
export function PracticeScoresCard({ scores, limitations }: PracticeScoresCardProps) {
  if (scores.length === 0) {
    return limitations ? <LimitationsNote limitations={limitations} /> : null;
  }
  const max = practiceScaleMax(scores);

  return (
    <section aria-labelledby="practice-scores-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="practice-scores-title" className="text-lg font-semibold text-text">
          Điểm ước tính luyện tập
        </h2>
        <span className="text-sm text-text-muted">Theo từng tiêu chí · thang {max}</span>
      </div>

      <ul className="mt-2 divide-y divide-border">
        {scores.map((score, i) => {
          const percent = Math.min(100, Math.max(0, (score.value / max) * 100));
          return (
            <li key={`${score.dimension}-${i}`} className="grid gap-x-8 gap-y-2 py-4 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] sm:items-center">
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 break-words text-base font-medium text-text">
                    {scoreCriterionLabel(score.dimension)}
                  </span>
                  <span className="shrink-0 text-base tabular-nums text-text-muted">
                    <span className="text-lg font-semibold text-text">{formatScore(score.value)}</span>/{max}
                  </span>
                </div>
                <MeterBar percent={percent} label={`${scoreCriterionLabel(score.dimension)}: ${formatScore(score.value)} trên ${max}`} className="mt-2" />
              </div>
              {score.note ? (
                <p className="min-w-0 break-words text-base leading-relaxed text-text-secondary">{score.note}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {limitations ? <LimitationsNote limitations={limitations} /> : null}
    </section>
  );
}
