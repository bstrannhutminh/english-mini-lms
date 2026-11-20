"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
export function BaselineBanner() {
  return <section className="rounded-xl border border-border bg-surface-muted p-5">
    <h2 className="text-lg font-semibold text-text">Thiết lập theo nhu cầu của bạn</h2>
    <p className="mt-2 text-base leading-relaxed text-text-secondary">Mục tiêu và tự đánh giá giúp chọn bài khởi đầu. Bạn vẫn có thể học ngay.</p>
    <Link href="/onboarding" className="mt-2 inline-flex min-h-11 items-center gap-2 text-base font-medium text-primary-dark">Mở thiết lập<Icon name="arrow-right" className="h-4 w-4" /></Link>
  </section>;
}
