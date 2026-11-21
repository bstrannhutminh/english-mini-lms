/**
 * RevisionComparisonsCard — "Từ bản đầu đến bản sửa": trích đoạn thật của
 * bản đầu và bản sửa (append-only, hai submission riêng) đặt cạnh nhau.
 * Excerpt rỗng (bài audio) hiển thị "(Bài nói – không có trích đoạn văn bản)".
 */
import Link from "next/link";
import { Badge, Icon, SkillTile } from "@/components/ui";
import { submittedAtParts } from "@/lib/format-submitted-at";
import { cn } from "@/lib/utils";
import type {
  ProgressSummaryContract,
  RevisionComparisonContract,
} from "@/contracts/progress";

function ExcerptBox({ title, date, excerpt, assisted, variant }: {
  title: string;
  date: string;
  excerpt: string;
  assisted: boolean;
  variant: "original" | "revised";
}) {
  const day = submittedAtParts(date)?.date;
  return (
    <div className={cn("min-w-0 rounded-xl border px-4 py-3.5", variant === "original" ? "border-border bg-surface-muted" : "border-emerald-100 bg-emerald-50/60")}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p className={cn("eyebrow", variant === "revised" && "text-emerald-800")}>
          {title}
          {day ? ` · ${day}` : ""}
        </p>
        <Badge tone={assisted ? "warning" : "success"}>{assisted ? "Có hỗ trợ" : "Độc lập"}</Badge>
      </div>
      <p className="mt-2 line-clamp-5 break-words text-base leading-relaxed text-text">
        {excerpt ? <>&ldquo;{excerpt}&rdquo;</> : <span className="text-text-muted">(Bài nói – không có trích đoạn văn bản)</span>}
      </p>
    </div>
  );
}

function ComparisonRow({ comp }: { comp: RevisionComparisonContract }) {
  return (
    <li className="min-w-0 py-5 first:pt-3 last:pb-0">
      <div className="flex items-center gap-3">
        <SkillTile mode={comp.mode} size="sm" />
        <h3 className="min-w-0 break-words text-base font-semibold text-text">{comp.activityTitle}</h3>
      </div>

      <div className="mt-3 grid grid-cols-1 items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-3">
        <ExcerptBox title="Bản đầu" date={comp.originalDate} excerpt={comp.originalExcerpt} assisted={comp.originalAssisted} variant="original" />
        <div aria-hidden="true" className="flex items-center justify-center text-text-muted">
          <Icon name="arrow-right" className="h-5 w-5 rotate-90 md:rotate-0" />
        </div>
        <ExcerptBox title="Bản sửa" date={comp.revisedDate} excerpt={comp.revisedExcerpt} assisted={comp.revisedAssisted} variant="revised" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5">
        <Link href={`/my-work/${comp.revisedSubmissionId}`} className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-primary-dark hover:underline">
          Mở bản sửa và góp ý
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
        <Link href={`/library/${comp.activityId}`} className="inline-flex min-h-11 items-center text-base text-text-secondary hover:text-text hover:underline">
          Luyện lại bài này
        </Link>
      </div>
    </li>
  );
}

export interface RevisionComparisonsCardProps {
  summary: ProgressSummaryContract;
}

export function RevisionComparisonsCard({ summary }: RevisionComparisonsCardProps) {
  const comparisons = summary.revisionComparisons;

  return (
    <section aria-labelledby="revision-comparisons-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="revision-comparisons-title" className="text-lg font-semibold text-text">Từ bản đầu đến bản sửa</h2>
      <p className="mt-0.5 text-base text-text-secondary">
        Bằng chứng cải thiện: cùng một bài, trước và sau khi sửa theo góp ý.
      </p>

      {comparisons.length === 0 ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-muted px-4 py-4">
          <Icon name="layers" className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
          <p className="min-w-0 text-base leading-relaxed text-text-secondary">
            Chưa có bài nào được sửa lại. Mở một bài đã có góp ý và bấm “Sửa ngay” — bản đầu và bản sửa sẽ được đặt cạnh nhau tại đây.{" "}
            <Link href="/my-work" className="font-medium text-primary-dark underline underline-offset-4">Xem bài của tôi</Link>
          </p>
        </div>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {comparisons.map((comp) => (
            <ComparisonRow key={comp.revisedSubmissionId} comp={comp} />
          ))}
        </ul>
      )}
    </section>
  );
}
