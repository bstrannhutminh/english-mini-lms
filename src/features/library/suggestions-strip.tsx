import Link from "next/link";
import { Icon } from "@/components/ui";

export interface Suggestion {
  activityId: string;
  title: string;
  reason: string;
  continueSessionId?: string;
  reviseParentId?: string;
}

/** Dải gợi ý mảnh trên lưới bài: một hàng bấm được (nhãn + tên bài + lý do + mũi tên). */
export function SuggestionsStrip({ suggestion }: { suggestion: Suggestion }) {
  const href = suggestion.continueSessionId ? `/learn/${suggestion.continueSessionId}` : `/library/${suggestion.activityId}${suggestion.reviseParentId ? `?revise=${encodeURIComponent(suggestion.reviseParentId)}` : ""}`;
  const label = suggestion.continueSessionId ? "Gợi ý · Tiếp nối buổi học" : suggestion.reviseParentId ? "Gợi ý · Sửa bài đã nộp" : "Gợi ý cho bạn";
  return (
    <section aria-label="Bài gợi ý trong kết quả">
      <Link href={href}
        className="group card-lift pressable flex min-h-14 items-center gap-3 rounded-2xl border border-teal-200 bg-primary-soft/60 px-4 py-3 no-underline">
        <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-primary-dark">
          <Icon name="sparkles" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="eyebrow block truncate text-primary-dark">{label}</span>
          <span className="line-clamp-2 text-base font-semibold leading-snug text-text sm:line-clamp-1">{suggestion.title}</span>
          <span className="block truncate text-sm leading-5 text-text-secondary">{suggestion.reason}</span>
        </span>
        <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-primary-dark transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
