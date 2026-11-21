"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { InProgressSession } from "@/contracts/today";
import { TodayLessonFrame } from "./today-lesson-frame";

export interface ContinueBlockProps { session: InProgressSession; }

/** Có phiên đang dở → thẻ chính là lối quay lại đúng chỗ đã dừng (1 chạm). */
export function ContinueBlock({ session }: ContinueBlockProps) {
  return (
    <TodayLessonFrame titleId="today-continue-title" title={session.title} label="Bài đang làm dở"
      mode={session.mode} durationMinutes={session.targetMinutes} slot={session.slot}
      description="Bản nháp đã được lưu. Tiếp tục ngay từ chỗ bạn đã dừng.">
      <Link href={`/learn/${session.sessionId}`} data-tour="today-start"
        className="pressable mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white no-underline shadow-card hover:bg-primary-dark sm:w-auto">
        <Icon name="play" className="h-5 w-5 shrink-0" />Tiếp tục bài học<Icon name="arrow-right" className="h-5 w-5 shrink-0" />
      </Link>
    </TodayLessonFrame>
  );
}
