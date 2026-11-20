"use client";

import { cn } from "@/lib/utils";
import type { CaptureHelpers, SessionListeningQuestion } from "../types";

/** Native radio inputs preserve keyboard selection and a generous touch target. */
export function ListeningQuestionsCard({ questions, answers, disabled, onSelectOption, capture, sourceRef }: {
  questions: SessionListeningQuestion[];
  answers: Record<string, string>;
  disabled: boolean;
  onSelectOption: (questionId: string, optionId: string) => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const answeredCount = questions.filter(q => answers[q.id]).length;
  if (questions.length === 0) return <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900">Bài nghe chưa có câu hỏi. Hãy báo quản trị bổ sung câu hỏi đã duyệt.</p>;
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold text-text">Câu hỏi nghe hiểu</h2>
      <p className="mb-6 mt-1 text-base text-text-secondary">Đã trả lời {answeredCount}/{questions.length}. Đáp án mở sau khi nộp.</p>
      <div className="space-y-6">
        {questions.map((question, index) => (
          <fieldset key={question.id} disabled={disabled} className="min-w-0 border-b border-border pb-6 last:border-0 last:pb-0">
            <legend {...capture.selectHandlers(question.prompt, `${sourceRef} · câu hỏi ${index + 1}`, "video")} className="mb-3 max-w-full text-base font-semibold leading-relaxed text-text">Câu {index + 1}. {question.prompt}</legend>
            <div className="space-y-2">
              {question.options.map(option => (
                <label key={option.id} className={cn("flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-base leading-relaxed transition focus-within:ring-2 focus-within:ring-primary/30", disabled ? "cursor-default opacity-60" : "cursor-pointer", answers[question.id] === option.id ? "border-primary bg-primary-soft text-primary-dark" : "border-border bg-surface text-text-secondary hover:bg-surface-muted")}>
                  <input type="radio" name={`listening-${question.id}`} value={option.id} checked={answers[question.id] === option.id} onChange={() => onSelectOption(question.id, option.id)} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                  <span><strong>{option.id.toUpperCase()}.</strong> {option.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
