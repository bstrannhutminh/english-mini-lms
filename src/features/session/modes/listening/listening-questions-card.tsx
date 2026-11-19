"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CaptureHelpers, SessionListeningQuestion } from "../types";

/**
 * Danh sách câu hỏi trắc nghiệm bài nghe (trước nộp).
 * Đồng bộ bảng màu Teal, nút chọn ≥ 44px, bôi đen câu hỏi để Smart Capture.
 */
export function ListeningQuestionsCard({
  questions,
  answers,
  disabled,
  onSelectOption,
  capture,
  sourceRef,
}: {
  questions: SessionListeningQuestion[];
  answers: Record<string, string>;
  disabled: boolean;
  onSelectOption: (questionId: string, optionId: string) => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  if (questions.length === 0) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <Icon name="alert-triangle" className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        <span>
          Bài nghe này chưa có câu hỏi trắc nghiệm. Vui lòng báo quản trị để bổ
          sung câu hỏi.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-base font-bold text-text">
          <Icon name="file-text" className="h-4.5 w-4.5 text-skill-listening" />
          <span>Câu hỏi nghe hiểu ({questions.length} câu)</span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-text-secondary">
          Đã chọn {answeredCount}/{questions.length} · đáp án mở sau khi nộp
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-xl border border-border-subtle bg-surface-muted p-4"
          >
            <div
              {...capture.selectHandlers(q.prompt, sourceRef)}
              className="mb-3 text-base font-bold leading-relaxed text-text"
            >
              Câu {idx + 1}: {q.prompt}
            </div>

            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label={`Câu ${idx + 1}`}
            >
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={disabled}
                    onClick={() => onSelectOption(q.id, opt.id)}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm leading-snug transition disabled:opacity-60",
                      isSelected
                        ? "border-2 border-primary bg-teal-50/70 font-medium text-primary-dark"
                        : "border-border bg-surface text-text-secondary hover:border-slate-300 hover:text-text"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-0 mt-4 text-center text-xs text-text-muted">
        Chọn đủ {questions.length} câu rồi bấm &ldquo;Nộp bài&rdquo; ở thanh
        dưới cùng.
      </p>
    </div>
  );
}
