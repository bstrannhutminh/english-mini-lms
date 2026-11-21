import Link from "next/link";
import { Icon } from "@/components/ui";
import { PageContainer } from "@/components/layout";

/** Trạng thái "không còn từ đến hạn" của phiên ôn viết câu — kèm lối về Hôm nay / Sổ từ. */
export function ReviewNothingDue() {
  return (
    <PageContainer size="narrow">
      <div className="hero-wash space-y-4 rounded-2xl border border-border p-6 text-center shadow-card sm:p-8">
        <span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text">
            Tuyệt vời! Bạn không còn từ nào đến hạn ôn hôm nay
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-base leading-relaxed text-text-secondary">
            Các từ vựng trong Sổ từ đã được xếp lịch Spaced Repetition
            (1 → 3 → 7 → 14 → 30 ngày). Hãy quay lại vào ngày mai hoặc thêm
            từ mới từ bài đọc y khoa.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Link
            href="/today"
            className="pressable inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-white no-underline shadow-card hover:bg-primary-dark"
          >
            Về trang Hôm nay
          </Link>
          <Link
            href="/vocab"
            className="pressable inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-base font-medium text-text-secondary no-underline hover:bg-surface-subtle hover:text-text"
          >
            Mở Sổ từ vựng
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
