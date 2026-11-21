import { StatTile } from "@/components/ui";

/** Đầu trang Sổ từ: tiêu đề + 3 con số nhìn nhanh (tổng, đến hạn, đã thuộc). */
export function VocabPageHeader({ totalCount, dueCount, masteredCount }: {
  totalCount: number;
  dueCount: number;
  masteredCount: number;
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Sổ từ</h1>
        <p className="mt-1 hidden max-w-prose text-base leading-relaxed text-text-secondary sm:block">Những cụm từ bạn đã gặp, cùng câu gốc và cách dùng của riêng bạn.</p>
      </div>
      <div role="group" aria-label="Tổng quan sổ từ" className="grid shrink-0 grid-cols-[1.3fr_1fr_1fr] divide-x divide-border rounded-2xl border border-border bg-surface py-3 sm:grid-cols-3 sm:py-4 [&>div]:px-3 sm:[&>div]:px-5">
        <StatTile label="Tổng số cụm từ" value={totalCount} icon="layers" hideIconOnMobile />
        <StatTile label="Đến hạn ôn" value={dueCount} icon="clock" iconClass="bg-amber-50 text-amber-700" hideIconOnMobile />
        <StatTile label="Đã thuộc" value={masteredCount} icon="check-circle" iconClass="bg-emerald-50 text-emerald-700" hideIconOnMobile />
      </div>
    </header>
  );
}
