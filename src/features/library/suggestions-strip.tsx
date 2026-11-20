import Link from "next/link";
import { Icon } from "@/components/ui";
export interface Suggestion {
  activityId: string;
  title: string;
  reason: string;
  continueSessionId?: string;
  reviseParentId?: string;
}
export function SuggestionsStrip({ suggestion }: {
  suggestion: Suggestion;
}) {
  const href = suggestion.continueSessionId ? `/learn/${suggestion.continueSessionId}` : `/library/${suggestion.activityId}${suggestion.reviseParentId ? `?revise=${encodeURIComponent(suggestion.reviseParentId)}` : ""}`;
  return <section aria-label="Bài gợi ý trong kết quả" className="rounded-xl border border-border bg-surface-muted px-4 py-3">
    <p className="text-base text-text-secondary">Gợi ý trong kết quả</p>
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary-dark">
      {suggestion.continueSessionId ? "Tiếp tục: " : suggestion.reviseParentId ? "Làm bản sửa: " : ""}
      {suggestion.title}
      <Icon name="arrow-right" className="h-4 w-4 shrink-0" />
    </Link>
    <p className="text-base leading-relaxed text-text-secondary">
      {suggestion.reason}
    </p>
  </section>;
}
