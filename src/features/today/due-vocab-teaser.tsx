"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
export interface DueVocabTeaserProps {
  count: number;
}
export function DueVocabTeaser({ count }: DueVocabTeaserProps) {
  if (count <= 0)
    return null;
  return <section className="rounded-xl border border-border bg-surface p-5">
    <h2 className="text-lg font-semibold text-text">{count} từ đến lượt ôn</h2>
    <p className="mt-2 text-base leading-relaxed text-text-secondary">Ôn cụm từ đã lưu hoặc dùng lại trong một câu mới.</p>
    <div className="mt-2 flex flex-col">
      <Link href="/vocab/flashcards" className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-primary-dark"><Icon name="cards" className="h-4 w-4" />Ôn flashcard</Link>
      <Link href="/vocab/review" className="inline-flex min-h-11 items-center gap-2 text-base text-text-secondary">Thử viết một câu<Icon name="arrow-right" className="h-4 w-4" /></Link>
    </div>
  </section>;
}
