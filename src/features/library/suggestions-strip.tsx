import Link from "next/link";
import { Icon } from "@/components/ui";

export interface Suggestion {
  /** Activity được gợi ý (id, vd. "W1"). */
  activityId: string;
  title: string;
  /** Lý do rule-based tiếng Việt (từ pickRecommendedActivity). */
  reason: string;
  /** Nếu gợi ý là nháp dở → id phiên để "Tiếp tục" 1 chạm thẳng vào /learn. */
  continueSessionId?: string;
  /** Nếu gợi ý là "viết/nói lại Bản 2" → id submission Bản 1, thread qua ?revise=. */
  reviseParentId?: string;
}

/**
 * Dải "Gợi ý" đứng đầu danh sách bài trong một chủ đề — giải thích được
 * (hiện `reason` rule-based), dẫn tới đúng bài hoặc tiếp tục phiên dở.
 * Component thuần — render ở server hoặc trong client đều được.
 */
export function SuggestionsStrip({ suggestion }: { suggestion: Suggestion }) {
  const href = suggestion.continueSessionId
    ? `/learn/${suggestion.continueSessionId}`
    : `/library/${suggestion.activityId}${
        suggestion.reviseParentId
          ? `?revise=${encodeURIComponent(suggestion.reviseParentId)}`
          : ""
      }`;

  return (
    <section
      aria-label="Bài gợi ý"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Icon name="sparkles" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-xs font-bold uppercase tracking-wide text-amber-800">
          Gợi ý cho bạn
        </p>
        <p className="m-0 mt-0.5 text-sm font-semibold leading-snug text-amber-950">
          {suggestion.title}
        </p>
        <p className="m-0 mt-1 text-xs leading-relaxed text-amber-800">
          {suggestion.reason}
        </p>
        <Link
          href={href}
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-amber-900 underline underline-offset-2"
        >
          {suggestion.continueSessionId
            ? "Tiếp tục phiên đang dở"
            : suggestion.reviseParentId
              ? "Làm Bản 2 ngay"
              : "Xem bài gợi ý"}
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
