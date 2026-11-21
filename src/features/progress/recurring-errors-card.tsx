/**
 * RecurringErrorsCard — "Những điểm cần luyện thêm": nhóm lỗi quan sát được
 * từ góp ý của AI (số lần + trích đoạn thật). Nhãn nhóm bằng tiếng Việt qua
 * lib/feedback-labels; category trùng tên kỹ năng (dữ liệu cũ) lấy mô tả
 * theo kỹ năng; category lạ → hiển thị chữ gốc (trung thực, không gán nhầm).
 */
import Link from "next/link";
import { Icon, MeterBar } from "@/components/ui";
import { feedbackCategoryLabel } from "@/lib/feedback-labels";
import { SKILL_INFO, type Skill } from "@/lib/modes";
import type {
  ProgressSummaryContract,
  RecurringErrorCategoryContract,
} from "@/contracts/progress";

/** Mô tả ngắn khi category là tên kỹ năng — phần "là lỗi gì", không phải mode config. */
const SKILL_CATEGORY_LABEL: Record<Skill, string> = {
  writing: "Ngữ pháp / Diễn đạt viết",
  reading: "Thuật ngữ / Dịch thuật",
  speaking: "Phát âm / Độ trôi chảy",
  listening: "Nhận diện âm / Shadowing",
};

function isSkillCategory(category: string): category is Skill {
  return category in SKILL_INFO;
}

function categoryLabel(category: string): string {
  return isSkillCategory(category) ? SKILL_CATEGORY_LABEL[category] : feedbackCategoryLabel(category);
}

function ErrorGroup({ err, maxCount }: { err: RecurringErrorCategoryContract; maxCount: number }) {
  const share = maxCount > 0 ? (err.count / maxCount) * 100 : 0;

  return (
    <li className="min-w-0 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 break-words text-base font-semibold text-text">{categoryLabel(err.category)}</h3>
        <span className="shrink-0 text-base tabular-nums text-text-secondary">
          <span className="font-semibold text-text">{err.count}</span> lần
        </span>
      </div>
      {/* Thanh tần suất tương đối — chỉ có nghĩa khi có nhóm lặp từ 2 lần trở lên */}
      {maxCount >= 2 ? (
        <MeterBar percent={share} fillClass="fill-amber-400" className="mt-2" />
      ) : null}

      {err.samples.length > 0 ? (
        <ul className="mt-3 space-y-1.5" aria-label="Trích đoạn bạn đã viết">
          {err.samples.map((sample, idx) => (
            <li key={idx} className="break-words border-l-2 border-border-strong pl-3 text-base leading-relaxed text-text-secondary">
              &ldquo;{sample}&rdquo;
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export interface RecurringErrorsCardProps {
  summary: ProgressSummaryContract;
}

export function RecurringErrorsCard({ summary }: RecurringErrorsCardProps) {
  const errors = summary.recurringErrors;
  const maxCount = errors.reduce((max, err) => Math.max(max, err.count), 0);

  return (
    <section aria-labelledby="recurring-errors-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="recurring-errors-title" className="text-lg font-semibold text-text">Những điểm cần luyện thêm</h2>
      <p className="mt-0.5 text-base text-text-secondary">
        Nhóm lỗi AI ghi nhận trong các bài đã chấm, kèm trích đoạn của bạn.
      </p>

      {errors.length === 0 ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-muted px-4 py-4">
          <Icon name="search" className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
          <p className="min-w-0 text-base leading-relaxed text-text-secondary">
            Chưa ghi nhận điểm nào. Danh sách sẽ xuất hiện sau khi bài nộp được chấm và có góp ý.{" "}
            <Link href="/my-work" className="font-medium text-primary-dark underline underline-offset-4">Xem bài của tôi</Link>
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {errors.map((err) => (
            <ErrorGroup key={err.category} err={err} maxCount={maxCount} />
          ))}
        </ul>
      )}
    </section>
  );
}
