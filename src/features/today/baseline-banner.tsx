"use client";

/**
 * BaselineBanner — nhắc khảo sát năng lực đầu vào khi baselineStatus
 * chưa "completed". Link tới /onboarding (15 phút).
 */
import Link from "next/link";
import { Icon } from "@/components/ui";

export function BaselineBanner() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-indigo-200/90 bg-indigo-50/80 p-5 shadow-xs sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Icon
          name="compass"
          className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700"
        />
        <div>
          <h3 className="text-sm font-bold text-indigo-950">
            Bạn chưa hoàn tất khảo sát năng lực đầu vào
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-indigo-700">
            Thiết lập mục tiêu và hoàn thành khảo sát 15 phút để lộ trình học
            được cá nhân hoá chuẩn xác.
          </p>
        </div>
      </div>
      <Link
        href="/onboarding"
        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-white shadow-xs transition hover:bg-indigo-700"
      >
        Làm bài khảo sát ngay →
      </Link>
    </div>
  );
}
