"use client";

/**
 * RecurringErrorsCard — lỗi lặp từ error_observations nhóm theo category,
 * kèm trích đoạn bằng chứng. Category trùng tên kỹ năng → icon/label từ
 * SKILL_INFO; category lạ → hiển thị tên thô (trung thực, không gán nhầm).
 */
import { Icon } from "@/components/ui";
import { SKILL_INFO, type Skill } from "@/lib/modes";
import type {
  ProgressSummaryContract,
  RecurringErrorCategoryContract,
} from "@/contracts/progress";

/** Mô tả ngắn theo category kỹ năng — phần "là lỗi gì", không phải mode config. */
const CATEGORY_DESCRIPTION: Record<Skill, string> = {
  writing: "Ngữ pháp / Diễn đạt viết",
  reading: "Thuật ngữ / Dịch thuật",
  speaking: "Phát âm / Độ trôi chảy",
  listening: "Nhận diện âm / Shadowing",
};

function isSkillCategory(category: string): category is Skill {
  return category in SKILL_INFO;
}

function ErrorGroup({ err }: { err: RecurringErrorCategoryContract }) {
  const cat = err.category;
  const label = isSkillCategory(cat) ? CATEGORY_DESCRIPTION[cat] : cat;
  const icon = isSkillCategory(cat) ? SKILL_INFO[cat].icon : "flag";
  const iconClass = isSkillCategory(cat)
    ? SKILL_INFO[cat].iconClass
    : "text-slate-500";

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 capitalize">
          <Icon name={icon} className={`h-3.5 w-3.5 ${iconClass}`} />
          <span>{label}</span>
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-amber-700">
          {err.count} lần
        </span>
      </div>

      {err.samples.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Trích đoạn lỗi:
          </span>
          {err.samples.map((s, idx) => (
            <p
              key={idx}
              className="rounded border border-slate-100 bg-white p-1.5 text-xs text-slate-700 italic"
            >
              &quot;{s}&quot;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export interface RecurringErrorsCardProps {
  summary: ProgressSummaryContract;
}

export function RecurringErrorsCard({ summary }: RecurringErrorsCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        <h2 className="text-sm font-bold text-slate-900">
          Lỗi lặp cần chú ý (Nhóm theo danh mục)
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Các điểm ngữ pháp và dùng từ thường gặp từ nhận xét của Gemini trong
          các bài nộp.
        </p>
      </div>

      {summary.recurringErrors.length === 0 ? (
        <p className="py-2 text-xs text-slate-400 italic">
          Chưa có đủ lỗi quan sát được ghi nhận — hệ thống sẽ liệt kê lỗi lặp
          sau khi các bài nộp được chấm.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summary.recurringErrors.map((err) => (
            <ErrorGroup key={err.category} err={err} />
          ))}
        </div>
      )}
    </section>
  );
}
