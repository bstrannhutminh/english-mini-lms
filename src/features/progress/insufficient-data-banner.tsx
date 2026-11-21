/**
 * InsufficientDataBanner — báo trung thực khi chưa đủ bằng chứng (< 3 bài nộp):
 * không vẽ xu hướng từ dữ liệu ít (invariant). Hiện rõ còn thiếu bao nhiêu bài.
 */
import Link from "next/link";
import { Icon, ProgressRing } from "@/components/ui";

/** Ngưỡng bài nộp tối thiểu — khớp hasSufficientData ở server/progress. */
const MIN_SUBMISSIONS = 3;

export function InsufficientDataBanner({ totalSubmissions = 0 }: { totalSubmissions?: number }) {
  const done = Math.min(MIN_SUBMISSIONS, Math.max(0, totalSubmissions));
  const remaining = MIN_SUBMISSIONS - done;

  return (
    <section aria-labelledby="insufficient-data-title" className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <ProgressRing
        value={done}
        max={MIN_SUBMISSIONS}
        size={56}
        strokeWidth={6}
        toneClass="text-amber-600"
        label={`${done} trên ${MIN_SUBMISSIONS} bài nộp cần có`}
      >
        <span className="text-base font-semibold tabular-nums text-amber-900">
          {done}/{MIN_SUBMISSIONS}
        </span>
      </ProgressRing>
      <div className="min-w-0">
        <h2 id="insufficient-data-title" className="text-lg font-semibold text-amber-950">
          Chưa đủ bằng chứng để nhận xét xu hướng
        </h2>
        <p className="mt-1 text-base leading-relaxed text-amber-900">
          Cần tối thiểu {MIN_SUBMISSIONS} bài nộp để nhận diện lỗi lặp và so sánh mức tiến bộ
          {remaining > 0 ? ` — còn thiếu ${remaining} bài.` : "."} Các con số bên dưới chỉ là ghi nhận ban đầu.
        </p>
        <Link href="/today" className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-amber-950 underline underline-offset-4">
          Làm bài hôm nay
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
