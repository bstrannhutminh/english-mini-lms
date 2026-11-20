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
    <Card className="border-teal-200/80 bg-teal-50/40">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white ">
            <Icon name="compass" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-text">
              Hồ sơ &amp; Lộ trình học tập
            </h2>
            <p className="mt-0.5 text-base leading-relaxed text-text-secondary">
              Nhịp học hiện tại: <strong>{targetMins} phút/ngày</strong> · khung{" "}
              <strong>{preferredTime}</strong>. Mở lại Onboarding bất cứ lúc nào
              để cập nhật mục tiêu, chuyên môn và tự đánh giá 4 kỹ năng.
            </p>
          </div>
        </div>

        <Link
          href="/onboarding"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-base font-semibold whitespace-nowrap text-white no-underline  transition hover:bg-primary-dark"
        >
          <span>Chỉnh lộ trình</span>
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
