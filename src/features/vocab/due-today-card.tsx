import Link from "next/link";
import { Icon, ProgressRing } from "@/components/ui";

interface DueTodayCardProps {
  dueCount: number;
  totalCount: number;
}

/**
 * Thẻ hành động chính của Sổ từ: vòng tiến trình (số từ đến hạn / tổng số) và
 * hai lối vào ôn — thẻ lật (chính) và dùng từ trong câu (phụ).
 */
export function DueTodayCard({ dueCount, totalCount }: DueTodayCardProps) {
  const hasDue = dueCount > 0;
  return (
    <section aria-label="Ôn từ hôm nay" className="hero-wash flex flex-col gap-5 rounded-2xl border border-border p-5 shadow-card sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div className="flex min-w-0 items-center gap-4">
        <ProgressRing value={hasDue ? dueCount : totalCount} max={Math.max(1, totalCount)} size={72} strokeWidth={7}
          toneClass={hasDue ? "text-amber-500" : "text-emerald-600"}
          label={hasDue ? `${dueCount} trên ${totalCount} cụm từ đến hạn ôn` : "Không có cụm từ nào đến hạn ôn"}>
          {hasDue
            ? <span className="text-2xl font-semibold tabular-nums text-text">{dueCount}</span>
            : <Icon name="check" className="h-7 w-7 text-emerald-600" />}
        </ProgressRing>
        <div className="min-w-0">
          <p className="eyebrow">Ôn hôm nay</p>
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-text">{hasDue ? `${dueCount} từ đến lượt ôn` : "Không có từ đến hạn hôm nay"}</h2>
          <p className="mt-0.5 hidden text-base leading-relaxed text-text-secondary sm:block">{hasDue ? "Dành ít phút nhớ lại từ trong ngữ cảnh đã học." : "Bạn vẫn có thể ôn tự do những cụm từ đã lưu."}</p>
        </div>
      </div>
      <div className="grid shrink-0 gap-2 sm:grid-cols-2 sm:gap-3 lg:flex">
        <Link href="/vocab/flashcards" data-tour="vocab-flashcards"
          className="pressable inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-white no-underline shadow-card hover:bg-primary-dark lg:px-6">
          <Icon name="cards" className="h-5 w-5 shrink-0" />{hasDue ? "Ôn bằng thẻ" : "Ôn tự do"}
        </Link>
        <Link href="/vocab/review" data-tour="vocab-review"
          className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-base font-medium text-text-secondary no-underline hover:bg-surface-subtle hover:text-text sm:min-h-13 sm:border sm:border-border-strong sm:bg-surface lg:px-6">
          <Icon name="pen" className="h-5 w-5 shrink-0" />Dùng từ trong câu<Icon name="arrow-right" className="h-4 w-4 shrink-0 sm:hidden" />
        </Link>
      </div>
    </section>
  );
}
