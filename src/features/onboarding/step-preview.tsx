"use client";
import { buildOnboardingSummary, type OnboardingDraft } from "./onboarding-presets";
interface StepPreviewProps {
  draft: OnboardingDraft;
}
export function StepPreview({ draft }: StepPreviewProps) {
  const summary = buildOnboardingSummary(draft);
  const loopSteps = [{ title: "Ôn từ đến hạn", minutes: summary.minutesSplit.warmup }, { title: "Làm bài trọng tâm", minutes: summary.minutesSplit.main }, { title: "Xem góp ý và thử lại", minutes: summary.minutesSplit.revise }, { title: "Lưu từ và khép phiên", minutes: summary.minutesSplit.wrapup }];
  return (<div className="space-y-6">

    <div>
      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">Xem lại trước khi vào học</h1>
      <p className="mt-2 text-base leading-relaxed text-text-secondary">Thiết lập sẽ được lưu khi bạn chọn “Lưu và vào học”. Có thể quay lại từng bước để chỉnh.</p>
    </div>

    <dl className="grid gap-x-6 sm:grid-cols-2">
      <div className="border-b border-border py-4">
        <dt className="text-base text-text-secondary">Tên hiển thị</dt>
        <dd className="mt-1 break-words text-base font-medium text-text">
          {draft.displayName.trim() || "Bác sĩ Minh"}
        </dd>
      </div>
      <div className="border-b border-border py-4">
        <dt className="text-base text-text-secondary">Nhịp học</dt>
        <dd className="mt-1 text-base font-medium text-text">{draft.targetMinutesDefault} phút{draft.preferredStudyTime ? ` · ${draft.preferredStudyTime}` : " · Chưa chọn giờ"}</dd>
      </div>
      <div className="border-b border-border py-4">
        <dt className="text-base text-text-secondary">Mục tiêu ưu tiên</dt>
        <dd className="mt-1 text-base leading-relaxed text-text">
          {draft.priorities.length ? draft.priorities.join("; ") : "Chưa chọn"}
        </dd>
      </div>
      <div className="border-b border-border py-4">
        <dt className="text-base text-text-secondary">Gợi ý kỹ năng khởi đầu</dt>
        <dd className="mt-1 text-base font-medium text-primary-dark">
          {summary.focusSkillLabel}
        </dd>
      </div>
      <div className="border-b border-border py-4">
        <dt className="text-base text-text-secondary">IELTS</dt>
        <dd className="mt-1 text-base text-text">
          {summary.ieltsLabel}
        </dd>
      </div>
      <div className="border-b border-border py-4">
        <dt className="text-base text-text-secondary">Sách hoặc tài liệu</dt>
        <dd className="mt-1 text-base text-text">
          {draft.currentBook.trim() || "Chưa chọn"}
        </dd>
      </div>
    </dl>

    <section className="border-t border-border pt-6">
      <h3 className="text-lg font-semibold text-text">Một buổi {draft.targetMinutesDefault} phút</h3>
      <ol className="mt-3 divide-y divide-border">
        {loopSteps.map((item, index) => <li key={item.title} className="flex items-center justify-between gap-3 py-3 text-base">
          <span className="text-text">{index + 1}. {item.title}</span>
          <span className="shrink-0 tabular-nums text-text-secondary">{item.minutes} phút</span>
        </li>)}
      </ol>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">Đây là phân bổ gợi ý. Bài và bước tiếp theo sẽ dựa vào lựa chọn cùng bài làm đã lưu.</p>
    </section>

  </div>);
}
