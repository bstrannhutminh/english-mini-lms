"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";

/** Nhắc nhẹ hoàn tất thiết lập mục tiêu — không chặn việc học. */
export function BaselineBanner() {
  return (
    <section className="rounded-2xl border border-dashed border-border-strong bg-surface-muted p-5">
      <h2 className="text-base font-semibold text-text">Học theo mục tiêu của bạn</h2>
      <p className="mt-1 text-base text-text-secondary">Bổ sung nhu cầu để gợi ý phù hợp hơn. Bạn vẫn có thể học ngay.</p>
      <Link href="/onboarding" className="pressable mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg text-base font-medium text-primary-dark">
        Mở thiết lập<Icon name="arrow-right" className="h-4 w-4" />
      </Link>
    </section>
  );
}
