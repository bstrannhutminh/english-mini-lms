"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * Nhắc nhẹ hoàn tất Onboarding (chỉ hiện khi người học đã bấm "Bỏ qua" trước đó).
 */
export function BaselineBanner() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 shadow-xs sm:flex-row sm:items-center sm:px-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-primary-dark">
          <Icon name="compass" className="h-4.5 w-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-text">
            Hoàn tất thiết lập lộ trình (chỉ 1 phút)
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
            Chọn mục tiêu, khung giờ và tài liệu đang đọc để trang Hôm nay gợi ý
            bài sát nhất với công việc của bạn.
          </p>
        </div>
      </div>
      <Link
        href="/onboarding"
        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-white no-underline shadow-xs transition hover:bg-primary-dark"
      >
        Thiết lập ngay
        <Icon name="arrow-right" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
