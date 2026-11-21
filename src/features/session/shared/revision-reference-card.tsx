import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

/**
 * Khung đối chiếu của phiên sửa lại (parentId), dùng chung cho Viết/Đọc/Nói:
 * tiêu đề bấm để thu gọn/mở, bên trong là góp ý ưu tiên rồi tới bản trước.
 * Trên mobile khung nằm trong tab riêng của SessionColumns nên không chiếm chỗ
 * vùng làm bài; desktop nằm đầu cột trái.
 */
export function RevisionReferenceCard({
  revision,
  open,
  onToggle,
  fullFeedbackHref,
  children,
}: {
  revision: number;
  open: boolean;
  onToggle: () => void;
  /** Trang góp ý đầy đủ của bản trước — mở tab mới để không rời phiên học. */
  fullFeedbackHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:mb-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left sm:px-5"
      >
        <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
          <Icon name="flag" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="eyebrow block">Bản sửa · đối chiếu</span>
          <span className="block text-base font-semibold text-text">Bản {revision} và góp ý cần sửa</span>
        </span>
        <span className="hidden text-sm text-text-muted sm:inline">{open ? "Thu gọn" : "Mở"}</span>
        <Icon name="chevron-down" className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-5 border-t border-border px-4 py-4 sm:px-5 sm:py-5">
          {children}
          {fullFeedbackHref && (
            <a
              href={fullFeedbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-primary-dark underline-offset-4 hover:underline"
            >
              Xem đầy đủ góp ý của bản {revision}
              <Icon name="external-link" className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}

/** Nhóm nội dung trong khung đối chiếu, có nhãn eyebrow. */
export function RevisionSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      {children}
    </div>
  );
}

/** Danh sách điểm cần sửa: vị trí → vấn đề → gợi ý sửa (chữ teal). */
export function RevisionFixList({
  items,
}: {
  items: Array<{ location?: string; original?: string; issue?: string; suggestion: string }>;
}) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-sm font-semibold tabular-nums text-text-secondary">
            {index + 1}
          </span>
          <div className="min-w-0 text-base leading-relaxed">
            {item.location && <p className="text-sm font-medium text-text-muted">{item.location}</p>}
            {item.original && <p className="border-l-2 border-border pl-3 italic text-text-secondary">{item.original}</p>}
            {item.issue && <p className="text-text">{item.issue}</p>}
            <p className="flex items-start gap-1.5 font-medium text-primary-dark">
              <Icon name="arrow-right" className="mt-1.5 h-3.5 w-3.5" />
              <span className="min-w-0">{item.suggestion}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
