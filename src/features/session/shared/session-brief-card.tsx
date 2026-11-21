import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

/** Kiểu chữ đọc thoải mái cho đề bài/đoạn văn (≈65 ký tự mỗi dòng, giãn đoạn). */
export const PROMPT_TEXT_CLASS =
  "max-w-[65ch] text-base leading-relaxed text-text [&>p+p]:mt-3 [&>p+ul]:mt-2 [&>ul+p]:mt-3 [&_li]:leading-relaxed";

/**
 * Thẻ đề bài dùng chung cho các mode (Viết/Đọc/Nói): nhãn eyebrow + thời lượng
 * khuyến nghị, tiêu đề mục, khối "Mục tiêu" nền nhạt và phần nội dung đề (children
 * — panel tự gắn Smart Capture lên vùng văn bản của mình).
 */
export function SessionBriefCard({
  eyebrow,
  title,
  durationMinutes,
  objective,
  children,
}: {
  eyebrow: string;
  title: string;
  durationMinutes?: number | null;
  objective?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="eyebrow">{eyebrow}</p>
        {durationMinutes ? (
          <p className="inline-flex items-center gap-1.5 text-sm tabular-nums text-text-muted">
            <Icon name="clock" className="h-3.5 w-3.5" />
            Khuyến nghị {durationMinutes} phút
          </p>
        ) : null}
      </div>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-text">{title}</h2>

      {objective && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-muted px-4 py-3">
          <Icon name="target" className="mt-1 h-4 w-4 text-primary" />
          <p className="min-w-0 text-base leading-relaxed text-text-secondary">
            <strong className="font-semibold text-text">Mục tiêu:</strong> {objective}
          </p>
        </div>
      )}

      {children && <div className="mt-5 border-t border-border pt-5">{children}</div>}
    </section>
  );
}
