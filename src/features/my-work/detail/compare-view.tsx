import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { feedbackCategoryLabel } from "@/lib/feedback-labels";
import { cn } from "@/lib/utils";
import { StructuredBody } from "./structured-body";
import type { MyWorkFeedback, ParentRevision, SubmissionDetail } from "../types";

interface CompareViewProps {
  current: SubmissionDetail;
  currentFeedback: MyWorkFeedback | null;
  parent: ParentRevision;
}

/**
 * So sánh Bản trước ↔ Bản đã sửa — xếp DỌC trên mobile, 2 cột từ lg.
 * Cột bản trước kèm tóm tắt góp ý đã nhận để đối chiếu khi đọc bản sửa
 * (hai bản là hai submission riêng — append-only qua parent_id).
 */
export function CompareView({ current, currentFeedback, parent }: CompareViewProps) {
  return (
    <section id="so-sanh" aria-labelledby="compare-title" className="scroll-mt-20 lg:scroll-mt-6">
      <h2 id="compare-title" className="text-xl font-semibold tracking-tight text-text">
        So sánh Bản {parent.submission.revision} và Bản {current.revision}
      </h2>
      <p className="mt-1 text-base text-text-secondary">
        Đọc lại bản trước cùng góp ý đã nhận, rồi xem bản sửa đã xử lý đến đâu.
      </p>
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <CompareColumn
          revision={parent.submission.revision}
          caption="trước khi sửa"
          audioUrl={parent.submission.audioUrl}
          pronunciation={parent.feedback?.pronunciation ?? null}
          body={parent.submission.body}
          observations={parent.feedback?.observations ?? []}
          openHref={`/my-work/${parent.submission.id}`}
        />
        <CompareColumn
          revision={current.revision}
          caption="đã sửa · bài đang xem"
          audioUrl={current.audioUrl}
          pronunciation={currentFeedback?.pronunciation ?? null}
          body={current.body}
          observations={[]}
          highlighted
        />
      </div>
    </section>
  );
}

interface CompareColumnProps {
  revision: number;
  caption: string;
  audioUrl?: string | null;
  pronunciation: { status: "assessed" | "not_assessable"; notes: string } | null;
  body: string | null;
  observations: MyWorkFeedback["observations"];
  /** Bản đang xem — viền teal để phân biệt với bản trước. */
  highlighted?: boolean;
  /** Link mở trang chi tiết của bản này (chỉ cho bản trước). */
  openHref?: string;
}

function CompareColumn({ revision, caption, audioUrl, pronunciation, body, observations, highlighted = false, openHref }: CompareColumnProps) {
  return (
    <article className={cn("flex min-w-0 flex-col gap-4 rounded-2xl border bg-surface p-5 sm:p-6", highlighted ? "border-teal-200 shadow-card" : "border-border")}>
      <header className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Badge tone={highlighted ? "success" : "neutral"}>Bản {revision}</Badge>
        <span className="text-base text-text-secondary">{caption}</span>
      </header>

      {audioUrl ? (
        <div>
          <p className="eyebrow mb-1.5">Bản ghi âm</p>
          <audio controls src={audioUrl} className="h-11 w-full" />
        </div>
      ) : null}

      {pronunciation ? (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-base leading-relaxed text-text-secondary">
          <span className="font-semibold text-text">Phát âm: </span>
          {pronunciation.notes}
        </p>
      ) : null}

      <div className="break-words text-base leading-relaxed text-text">
        <StructuredBody body={body} />
      </div>

      {observations.length > 0 ? (
        <>
          {/* Mobile: thu gọn để Bản sửa nằm ngay dưới Bản trước; ≥lg: mở sẵn cạnh nhau */}
          <details className="group border-t border-border lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-base font-medium text-text [&::-webkit-details-marker]:hidden">
              Góp ý đã nhận ở bản này ({observations.length})
              <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <ObservationSummaryList observations={observations} />
          </details>
          <div className="hidden border-t border-border pt-4 lg:block">
            <p className="eyebrow mb-1">Góp ý đã nhận ở bản này ({observations.length})</p>
            <ObservationSummaryList observations={observations} />
          </div>
        </>
      ) : null}

      {openHref ? (
        <Link href={openHref} className="inline-flex min-h-11 items-center gap-1.5 self-start text-base font-medium text-primary-dark hover:underline">
          Mở Bản {revision} và toàn bộ góp ý
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      ) : null}
    </article>
  );
}

/** Tóm tắt góp ý của bản trước (vị trí, câu gốc, cách sửa, câu mẫu) — bản đầy đủ nằm ở trang của bản đó. */
function ObservationSummaryList({ observations }: { observations: MyWorkFeedback["observations"] }) {
  return (
    <ul className="divide-y divide-border">
      {observations.map((obs, idx) => (
        <li key={idx} className="py-3 text-base leading-relaxed">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Badge tone="neutral">{feedbackCategoryLabel(obs.category)}</Badge>
            <span className="font-medium text-text-secondary">{obs.location}</span>
          </p>
          <p className="mt-2 break-words text-text-secondary">&ldquo;{obs.original}&rdquo;</p>
          <p className="mt-1 break-words text-text">
            <span className="font-semibold">Cách sửa: </span>
            {obs.suggestion}
          </p>
          {obs.example ? (
            <p className="mt-1 break-words text-emerald-800">
              <span className="font-semibold">Câu mẫu: </span>&ldquo;{obs.example}&rdquo;
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
