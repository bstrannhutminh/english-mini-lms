"use client";

/**
 * Trình sửa câu hỏi nghe DẠNG FORM — không chỉnh JSON thô.
 * Mỗi câu: prompt, 2–6 lựa chọn (id tự A/B/C…), đáp án đúng, giải thích,
 * mốc giây nghe lại. Validate live bằng validateListeningQuestions.
 */
import { useMemo } from "react";
import { Button, Icon } from "@/components/ui";
import {
  validateListeningQuestions,
  type ListeningQuestion,
} from "@/lib/listening-questions";
import { Field, inputCls } from "./form-bits";
import {
  draftToQuestion,
  newOptionId,
  newQuestionDraft,
  type QuestionDraft,
} from "./wizard/wizard-types";

/** ListeningQuestion[] (DB) → draft cho editor. */
export function questionsToDrafts(
  questions: ListeningQuestion[] | null | undefined
): QuestionDraft[] {
  return (questions ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation ?? "",
    timestampRef:
      q.timestamp_reference != null ? String(q.timestamp_reference) : "",
  }));
}

export function draftsToQuestions(
  drafts: QuestionDraft[]
): ListeningQuestion[] {
  return drafts.map(draftToQuestion);
}

export default function QuestionsFields({
  value,
  onChange,
}: {
  value: QuestionDraft[];
  onChange: (drafts: QuestionDraft[]) => void;
}) {
  const check = useMemo(
    () => validateListeningQuestions(draftsToQuestions(value)),
    [value]
  );

  const setQ = (i: number, patch: Partial<QuestionDraft>) =>
    onChange(value.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-sm text-slate-500 italic">
          Chưa có câu hỏi — bài nghe cần ít nhất 1 câu để được duyệt.
        </p>
      )}

      {value.map((q, i) => {
        const setOpt = (j: number, patch: Partial<{ id: string; text: string }>) =>
          setQ(i, {
            options: q.options.map((o, k) => (k === j ? { ...o, ...patch } : o)),
          });
        return (
          <fieldset
            key={i}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Câu {i + 1} <code className="text-xs text-slate-400">({q.id})</code>
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Xoá câu ${i + 1}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                <Icon name="trash" className="h-4 w-4" /> Xoá
              </Button>
            </div>

            <Field label="Nội dung câu hỏi">
              <input
                className={inputCls}
                value={q.prompt}
                placeholder="What does the speaker say about…?"
                onChange={(e) => setQ(i, { prompt: e.target.value })}
              />
            </Field>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Lựa chọn</span>
              {q.options.map((o, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="w-7 shrink-0 text-center text-sm font-bold text-slate-500">
                    {o.id}
                  </span>
                  <input
                    className={inputCls}
                    value={o.text}
                    placeholder={`Đáp án ${o.id}`}
                    aria-label={`Lựa chọn ${o.id} của câu ${i + 1}`}
                    onChange={(e) => setOpt(j, { text: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Xoá lựa chọn ${o.id}`}
                    disabled={q.options.length <= 2}
                    onClick={() =>
                      setQ(i, { options: q.options.filter((_, k) => k !== j) })
                    }
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={q.options.length >= 6}
                onClick={() =>
                  setQ(i, {
                    options: [
                      ...q.options,
                      { id: newOptionId(q.options), text: "" },
                    ],
                  })
                }
              >
                <Icon name="plus" className="h-4 w-4" /> Thêm lựa chọn
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Đáp án đúng">
                <select
                  className={inputCls}
                  value={q.correctOptionId}
                  onChange={(e) => setQ(i, { correctOptionId: e.target.value })}
                >
                  {q.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mốc giây nghe lại" hint="tuỳ chọn">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={q.timestampRef}
                  placeholder="vd 42"
                  onChange={(e) => setQ(i, { timestampRef: e.target.value })}
                />
              </Field>
              <Field label="Giải thích" hint="tuỳ chọn">
                <input
                  className={inputCls}
                  value={q.explanation}
                  onChange={(e) => setQ(i, { explanation: e.target.value })}
                />
              </Field>
            </div>
          </fieldset>
        );
      })}

      <Button
        variant="outline"
        onClick={() => onChange([...value, newQuestionDraft(value.length)])}
      >
        <Icon name="plus" className="h-4 w-4" /> Thêm câu hỏi
      </Button>

      {!check.ok && (
        <ul
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 list-disc pl-6 space-y-0.5"
        >
          {check.errors.slice(0, 8).map((e, i) => (
            <li key={i}>{e}</li>
          ))}
          {check.errors.length > 8 && <li>…và {check.errors.length - 8} lỗi khác</li>}
        </ul>
      )}
    </div>
  );
}
