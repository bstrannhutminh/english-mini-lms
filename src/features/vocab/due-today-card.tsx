import Link from "next/link";
import { Icon } from "@/components/ui";

interface DueTodayCardProps {
  /** Số từ đến hạn ôn (dueAt <= now, chưa đạt trần mastery). */
  dueCount: number;
}

/**
 * Thẻ "Ôn hôm nay" — block đầu trang Sổ từ (§3.2: đầu trang có thẻ Ôn hôm nay).
 * 1 chạm vào luồng ôn: flashcard quẹt nhanh hoặc thử thách câu (AI chấm).
 */
export function DueTodayCard({ dueCount }: DueTodayCardProps) {
  if (dueCount <= 0) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Icon name="check-circle" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Không còn từ nào đến hạn ôn hôm nay
            </p>
            <p className="text-xs text-emerald-800">
              Có thể ôn tự do bằng Flashcard hoặc lưu thêm từ từ bài đọc.
            </p>
          </div>
        </div>
        <Link
          href="/vocab/flashcards"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <Icon name="cards" className="h-4 w-4" />
          Ôn tự do
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Icon name="clock" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-amber-950">
            Ôn hôm nay: {dueCount} từ đến hạn
          </p>
          <p className="text-xs text-amber-900">
            Ôn trước ≤5 phút rồi vào bài chính — theo lịch lặp lại ngắt quãng.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/vocab/flashcards"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700 sm:flex-none"
        >
          <Icon name="cards" className="h-4 w-4" />
          Ôn nhanh Flashcard
        </Link>
        <Link
          href="/vocab/review"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-700 sm:flex-none"
        >
          <Icon name="sparkles" className="h-4 w-4" />
          Thử thách câu
        </Link>
      </div>
    </div>
  );
}
