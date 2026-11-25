"use client";

import { cn } from "@/lib/utils";
import type { CaptureHelpers, SessionListeningQuestion } from "../types";

/**
 * Câu hỏi trắc nghiệm của bài nghe: mỗi lựa chọn là một hàng lớn dễ chạm
 * (≥56px) với ô chữ cái tô teal khi chọn. Radio gốc vẫn nằm trong label
 * (sr-only) nên giữ nguyên điều hướng bàn phím và ngữ nghĩa form.
 */
export function ListeningQuestionsCard({ questions, answers, disabled, onSelectOption, capture, sourceRef }: {
  questions: SessionListeningQuestion[];
  answers: Record<string, string>;
  disabled: boolean;
  onSelectOption: (questionId: string, optionId: string) => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const answeredCount = questions.filter(q => answers[q.id]).length;
  if (questions.length === 0) return <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900">Bài nghe chưa có câu hỏi. Hãy báo quản trị bổ sung câu hỏi đã duyệt.</p>;
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Bài làm</p>
          <h2 className="text-lg font-semibold text-text">Câu hỏi nghe hiểu</h2>
        </div>
        <p className={cn("text-base font-semibold tabular-nums", answeredCount === questions.length ? "text-emerald-700" : "text-text")}>
          {answeredCount}<span className="font-normal text-text-muted">/{questions.length} câu</span>
        </p>
      </div>
      <div aria-hidden="true" className="mt-3 flex gap-1.5">
        {questions.map(q => <span key={q.id} className={cn("h-1.5 flex-1 rounded-full transition-colors", answers[q.id] ? "bg-primary" : "bg-surface-subtle")} />)}
      </div>
      <p className="mt-2 text-sm text-text-secondary">Đã trả lời {answeredCount}/{questions.length}. Đáp án mở sau khi nộp.</p>

      <div className="mt-5 space-y-6">
        {questions.map((question, index) => (
          <fieldset key={question.id} disabled={disabled} className="min-w-0 border-t border-border pt-5">
            <legend {...capture.selectHandlers(question.prompt, `${sourceRef} · câu hỏi ${index + 1}`, "video")} className="float-left mb-3 w-full max-w-full break-words text-base font-semibold leading-relaxed text-text">
              <span className="eyebrow block">Câu {index + 1}</span>
              {question.prompt}
            </legend>
            <div className="clear-both space-y-2">
              {question.options.map(option => {
                const selected = answers[question.id] === option.id;
                return (
                  <label key={option.id} className={cn("pressable flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2.5 text-base leading-relaxed focus-within:ring-2 focus-within:ring-primary/40", disabled ? "cursor-default opacity-60" : "cursor-pointer", selected ? "border-primary bg-primary-soft text-text" : "border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-muted")}>
                    <input type="radio" name={`listening-${question.id}`} value={option.id} checked={selected} onChange={() => onSelectOption(question.id, option.id)} className="sr-only" />
                    <span aria-hidden="true" className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold", selected ? "border-primary bg-primary text-white" : "border-border-strong bg-surface text-text-secondary")}>{option.id.toUpperCase()}</span>
                    <span className="min-w-0 break-words"><span className="sr-only">{option.id.toUpperCase()}. </span>{option.text}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
