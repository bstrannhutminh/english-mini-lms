"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";

export interface DueVocabTeaserProps { count: number; }

/** Thẻ ôn từ đến hạn — bước khởi động 5 phút, mở thẳng bộ thẻ. */
export function DueVocabTeaser({ count }: DueVocabTeaserProps) {
  if (count <= 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
          <Icon name="cards" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Sổ từ vựng</p>
          <h2 className="text-lg font-semibold tracking-tight text-text">{count} từ đến lượt ôn</h2>
        </div>
      </div>
      <p className="mt-3 text-base text-text-secondary">Khoảng 5 phút để nhớ lại từ trong đúng ngữ cảnh đã gặp.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href="/vocab/flashcards" className="pressable inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary bg-surface px-4 text-base font-medium text-primary-dark no-underline hover:bg-primary-soft">
          Ôn bằng thẻ<Icon name="arrow-right" className="h-4 w-4" />
        </Link>
        <Link href="/vocab/review" className="pressable inline-flex min-h-11 items-center rounded-lg px-3 text-base text-text-secondary no-underline hover:bg-surface-subtle hover:text-primary-dark">
          Dùng trong câu
        </Link>
      </div>
    </section>
  );
}
