"use client";

import Link from "next/link";
import type { ReviewOutcome } from "@/server/vocabulary/schedule";

export interface CompletedReview {
  phrase: string;
  status: ReviewOutcome;
  intervalDays: number;
}

interface ReviewSummaryProps {
  completed: CompletedReview[];
  total: number;
}

/** Tổng kết phiên ôn micro-challenge — liệt kê kết quả từng từ + điều hướng. */
export function ReviewSummary({ completed, total }: ReviewSummaryProps) {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto">
          🎉
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Hoàn thành phiên ôn từ hôm nay!
        </h2>
        <p className="text-xs text-slate-600">
          Bạn đã ôn tập {total} từ theo phương pháp Spaced Repetition.
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-2 max-w-sm mx-auto">
          <div className="text-xs font-semibold text-slate-700 mb-2">Kết quả:</div>
          {completed.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">{item.phrase}</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  item.status === "correct"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status === "correct"
                  ? `Đạt • Ôn lại sau ${item.intervalDays} ngày`
                  : "Cần cải thiện • Hẹn ngày mai"}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Link
            href="/today"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            Về trang Hôm nay →
          </Link>
          <Link
            href="/vocab"
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs transition"
          >
            Xem Sổ từ vựng
          </Link>
        </div>
      </div>
    </div>
  );
}
