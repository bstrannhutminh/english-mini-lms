"use client";

import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { PageContainer } from "@/components/layout";
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
    <PageContainer size="narrow">
      <div className="hero-wash space-y-4 rounded-2xl border border-border p-5 text-center shadow-card sm:p-8">
        <span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-text">
          Hoàn thành phiên ôn từ hôm nay!
        </h2>
        <p className="text-base leading-relaxed text-text-secondary">
          Bạn đã ôn tập {total} từ theo phương pháp Spaced Repetition.
        </p>

        <div className="rounded-xl bg-surface-muted p-4 text-left">
          <h3 className="eyebrow mb-1">Kết quả</h3>
          <ul className="divide-y divide-border">
            {completed.map((item, idx) => (
              <li key={idx} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-base">
                <span className="min-w-0 break-words font-medium text-text">{item.phrase}</span>
                <Badge tone={item.status === "correct" ? "success" : "warning"}>
                  {item.status === "correct"
                    ? `Đạt • Ôn lại sau ${item.intervalDays} ngày`
                    : "Cần cải thiện • Hẹn ngày mai"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Link
            href="/today"
            className="pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white no-underline shadow-card hover:bg-primary-dark"
          >
            Về trang Hôm nay<Icon name="arrow-right" className="h-4 w-4" />
          </Link>
          <Link
            href="/vocab"
            className="pressable inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-base font-medium text-text-secondary no-underline hover:bg-surface-subtle hover:text-text"
          >
            Xem Sổ từ vựng
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
