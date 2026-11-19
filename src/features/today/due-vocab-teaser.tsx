"use client";

/**
 * DueVocabTeaser — banner từ vựng đến hạn (SRS). Chỉ render khi count > 0
 * (không có gì đến hạn thì không làm phiền — bước Ôn từ trong SessionPlan
 * đã tự báo "xong").
 */
import Link from "next/link";
import { Icon } from "@/components/ui";

export interface DueVocabTeaserProps {
  count: number;
}

export function DueVocabTeaser({ count }: DueVocabTeaserProps) {
  if (count <= 0) return null;

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-5 shadow-xs sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Icon
          name="sparkles"
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
        />
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
            <span>Sổ từ vựng y khoa</span>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold tabular-nums text-white">
              {count} từ cần ôn
            </span>
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
            Ôn ngay bằng Spaced Repetition để khắc sâu thuật ngữ vào trí nhớ
            dài hạn.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/vocab/flashcards"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-white shadow-xs transition hover:bg-emerald-800"
        >
          <Icon name="cards" className="h-3.5 w-3.5" />
          <span>Ôn nhanh bằng Flashcard</span>
        </Link>
        <Link
          href="/vocab/review"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap text-emerald-800 shadow-xs transition hover:bg-emerald-50"
        >
          Thử thách câu →
        </Link>
      </div>
    </div>
  );
}
