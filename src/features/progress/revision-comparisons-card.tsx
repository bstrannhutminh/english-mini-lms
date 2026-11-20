"use client";

/**
 * RevisionComparisonsCard — so sánh Bản đầu / Bản sửa (bằng chứng cải thiện).
 * Excerpt rỗng (bài audio) hiển thị "(Audio / dữ liệu)". Trạng thái mở rộng
 * nằm cục bộ trong component.
 */
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  ProgressSummaryContract,
  RevisionComparisonContract,
} from "@/contracts/progress";

function ExcerptBox({
  title,
  excerpt,
  assisted,
  variant,
}: {
  title: string;
  excerpt: string;
  assisted: boolean;
  variant: "original" | "revised";
}) {
  return (
    <div
      className={cn(
        "space-y-1 rounded-lg border p-3 text-base",
        variant === "original"
          ? "border-slate-200/60 bg-slate-50"
          : "border-emerald-200/60 bg-emerald-50/50"
      )}
    >
      <div className="flex items-center justify-between text-base">
        <span
          className={cn(
            "font-semibold",
            variant === "original" ? "text-slate-600" : "text-emerald-900"
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-base font-semibold",
            assisted
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          )}
        >
          {assisted ? "Có hỗ trợ" : "Độc lập"}
        </span>
      </div>
      <p
        className={cn(
          "line-clamp-3 italic",
          variant === "original" ? "text-slate-700" : "text-slate-800"
        )}
      >
        &quot;{excerpt || "(Audio / dữ liệu)"}&quot;
      </p>
    </div>
  );
}

function ComparisonRow({ comp }: { comp: RevisionComparisonContract }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 sm:text-base">
            {comp.activityTitle}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="min-h-11 cursor-pointer rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-base font-semibold text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
        >
          {expanded ? "Thu gọn ▲" : "Xem so sánh ▼"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
        <ExcerptBox
          title="Bản đầu (Lần 1)"
          excerpt={comp.originalExcerpt}
          assisted={comp.originalAssisted}
          variant="original"
        />
        <ExcerptBox
          title="Bản sửa (Lần 2+)"
          excerpt={comp.revisedExcerpt}
          assisted={comp.revisedAssisted}
          variant="revised"
        />
      </div>

      {expanded && (
        <div className="flex justify-end border-t border-slate-100 pt-2 text-base text-slate-600">
          <Link
            href={`/library/${comp.activityId}`}
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-base font-semibold text-primary-dark hover:underline"
          >
            Mở bài tập này để luyện thêm →
          </Link>
        </div>
      )}
    </div>
  );
}

export interface RevisionComparisonsCardProps {
  summary: ProgressSummaryContract;
}

export function RevisionComparisonsCard({
  summary,
}: RevisionComparisonsCardProps) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 ">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          So sánh bài gốc &amp; Bản sửa (Revisions)
        </h2>
        <p className="mt-0.5 text-base text-slate-500">
          Bằng chứng cải thiện thực tế giữa lần nộp đầu và các lần sửa lại sau
          phản hồi của AI.
        </p>
      </div>

      {summary.revisionComparisons.length === 0 ? (
        <div className="py-6 text-center text-base text-slate-400 italic">
          Chưa có bài nào được viết/nói lại bản sửa. Khi bạn sửa bài dựa trên
          góp ý, các bản so sánh sẽ xuất hiện tại đây.
        </div>
      ) : (
        <div className="space-y-3">
          {summary.revisionComparisons.map((comp) => (
            <ComparisonRow
              key={comp.revisedSubmissionId}
              comp={comp}
            />
          ))}
        </div>
      )}
    </section>
  );
}
