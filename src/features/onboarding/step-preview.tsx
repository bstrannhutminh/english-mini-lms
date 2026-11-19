"use client";

import { Icon, type IconName } from "@/components/ui";
import {
  buildOnboardingSummary,
  type OnboardingDraft,
} from "./onboarding-presets";

interface StepPreviewProps {
  draft: OnboardingDraft;
}

/** Bước 4 Onboarding: Tóm tắt lộ trình cá nhân + Hướng dẫn chu trình học 4 bước. */
export function StepPreview({ draft }: StepPreviewProps) {
  const summary = buildOnboardingSummary(draft);

  const loopSteps: Array<{
    step: string;
    title: string;
    minutes: number;
    desc: string;
    icon: IconName;
  }> = [
    {
      step: "1",
      title: "Ôn từ đến hạn",
      minutes: summary.minutesSplit.warmup,
      desc: "Quẹt nhanh flashcard hoặc đặt 1 câu thực tế theo lịch 1–3–7–14–30 ngày.",
      icon: "sparkles",
    },
    {
      step: "2",
      title: "Làm 1 bài trọng tâm",
      minutes: summary.minutesSplit.main,
      desc: "Tự viết, đọc–dịch, ghi âm nói hoặc nghe hiểu không xao nhãng trong chế độ Tập trung.",
      icon: "play",
    },
    {
      step: "3",
      title: "Xem góp ý AI & Sửa bản 2",
      minutes: summary.minutesSplit.revise,
      desc: "AI chỉ đúng tối đa 3 điểm ưu tiên → bạn sửa thành Bản 2 cạnh Bản 1 để tiến bộ thật.",
      icon: "pen-tool",
    },
    {
      step: "4",
      title: "Lưu cụm từ & Chốt phiên",
      minutes: summary.minutesSplit.wrapup,
      desc: "Bôi đen thuật ngữ y khoa để lưu 1 chạm vào Sổ từ và xem tiến độ thực học.",
      icon: "bar-chart",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Lộ trình khởi đầu của {draft.displayName || "bạn"} đã sẵn sàng
        </h2>
        <p className="mt-1.5 text-base leading-relaxed text-text-secondary">
          Mỗi ngày chỉ cần mở trang <strong>Hôm nay</strong> và làm theo chu
          trình 4 bước gọn nhẹ dưới đây.
        </p>
      </div>

      {/* Tóm tắt cấu hình vừa chọn */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4 sm:grid-cols-3">
        <div className="rounded-xl bg-surface p-3.5 shadow-xs">
          <span className="text-xs font-medium text-text-muted">Nhịp học</span>
          <p className="mt-0.5 text-base font-bold text-text">
            {draft.targetMinutesDefault} phút · lúc {draft.preferredStudyTime}
          </p>
        </div>
        <div className="rounded-xl bg-surface p-3.5 shadow-xs">
          <span className="text-xs font-medium text-text-muted">
            Ưu tiên khởi đầu
          </span>
          <p className="mt-0.5 text-base font-bold text-primary-dark">
            {summary.focusSkillLabel}
          </p>
        </div>
        <div className="rounded-xl bg-surface p-3.5 shadow-xs">
          <span className="text-xs font-medium text-text-muted">Định hướng</span>
          <p className="mt-0.5 text-sm font-semibold text-text">
            {summary.ieltsLabel}
          </p>
        </div>
      </div>

      {/* Chu trình học 4 bước mỗi ngày */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-text">
            <Icon name="compass" className="h-4.5 w-4.5 text-primary" />
            Cách học hiệu quả mỗi ngày ({draft.targetMinutesDefault} phút)
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Không học vẹt
          </span>
        </div>

        <ol className="space-y-2.5">
          {loopSteps.map((item) => (
            <li
              key={item.step}
              className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-muted/70 p-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-text">
                    {item.title}
                  </span>
                  <span className="text-xs font-medium tabular-nums text-text-muted">
                    ~{item.minutes} phút
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Tuần đầu làm quen */}
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-text-secondary">
        <p className="font-semibold text-text">
          Gợi ý tuần đầu tiên (làm quen 4 kỹ năng)
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          Mỗi ngày thử 1 kỹ năng (Viết email hội nghị → Đọc–dịch đoạn siêu âm →
          Tự giới thiệu 60 giây → Nghe bài giảng y khoa). Sau khi có đủ bài làm
          thật, trang <strong>Tiến độ</strong> sẽ tự động tổng hợp lỗi hay lặp
          để bạn sửa dứt điểm.
        </p>
      </div>
    </div>
  );
}
