import Link from "next/link";
import { Icon } from "@/components/ui";

/** Vocabulary context and the two existing review entry points. */
export function VocabPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-200/80 bg-teal-50 text-primary-dark">
            <Icon name="bookmark" className="h-4.5 w-4.5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
            Sổ từ
          </h1>
        </div>
        <p className="mt-1 pl-11.5 text-base text-text-secondary">
          Lưu theo ngữ cảnh thực tế · Ôn ngắt quãng 1–3–7–14–30 ngày
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/vocab/flashcards"
          data-tour="vocab-flashcards"
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-base font-medium text-text no-underline  transition hover:bg-surface-muted"
        >
          <Icon name="cards" className="h-4 w-4" />
          <span>Ôn Flashcard</span>
        </Link>
        <Link
          href="/vocab/review"
          data-tour="vocab-review"
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-primary/40 bg-teal-50/70 px-4 text-base font-semibold text-primary-dark no-underline transition hover:bg-teal-100/70"
        >
          <Icon name="sparkles" className="h-4 w-4" />
          <span>Thử thách đặt câu</span>
        </Link>
      </div>
    </div>
  );
}
