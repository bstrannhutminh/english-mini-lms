"use client";

import Link from "next/link";
import { Card, Icon } from "@/components/ui";
import type { LearnerProfile } from "@/contracts/settings";

/** Thẻ truy cập nhanh vào Onboarding 4 bước để đổi mục tiêu, nhịp học 30'/45' và sách y. */
export function LearningPlanCard({
  profile,
}: {
  profile: LearnerProfile | null;
}) {
  const prefs = profile?.preferences ?? {};
  const targetMins = prefs.targetMinutesDefault === 45 ? 45 : 30;
  const preferredTime =
    typeof prefs.preferredStudyTime === "string" && prefs.preferredStudyTime
      ? prefs.preferredStudyTime
      : "21:00";

  return (
    <Card elevated className="hero-wash flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow">Lộ trình hiện tại</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-text">
          {targetMins} phút/ngày <span className="font-normal text-text-secondary">· khung {preferredTime}</span>
        </h3>
        <p className="mt-1 text-base leading-relaxed text-text-secondary">
          Mở lại Onboarding bất cứ lúc nào để cập nhật mục tiêu, chuyên môn và tự đánh giá 4 kỹ năng.
        </p>
      </div>
      <Link
        href="/onboarding"
        className="pressable inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold whitespace-nowrap text-white no-underline shadow-card hover:bg-primary-dark"
      >
        <span>Chỉnh lộ trình</span>
        <Icon name="arrow-right" className="h-4 w-4" />
      </Link>
    </Card>
  );
}
