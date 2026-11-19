"use client";

import type { CaptureHelpers, SessionListeningQuestion } from "../types";

/**
 * Danh sách câu hỏi trắc nghiệm bài nghe (trước nộp).
 * Nút nộp nằm ở thanh hành động dính đáy của shell — thẻ này chỉ lo chọn đáp án.
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
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠️ Bài nghe này chưa có câu hỏi trắc nghiệm. Vui lòng báo quản trị để bổ
        sung câu hỏi.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="text-base font-bold text-slate-900">
          📝 Câu hỏi nghe hiểu ({questions.length} câu):
        </div>
        <span className="text-xs text-slate-500">
          Đã chọn {answeredCount}/{questions.length} · đáp án mở sau khi nộp
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div
              {...capture.selectHandlers(q.prompt, sourceRef)}
              className="mb-3 text-[15px] font-bold leading-relaxed text-slate-800"
            >
              Câu {idx + 1}: {q.prompt}
            </div>

            <div className="flex flex-col gap-2" role="radiogroup" aria-label={`Câu ${idx + 1}`}>
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
                    className={`flex min-h-[44px] items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm leading-snug transition-colors disabled:opacity-60 ${
                      isSelected
                        ? "border-blue-600 border-2 bg-blue-50 text-blue-800"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-0 mt-4 text-center text-xs text-slate-400">
        Chọn đủ {questions.length} câu rồi bấm «Nộp bài» ở thanh dưới cùng.
      </p>
    </div>
  );
}
