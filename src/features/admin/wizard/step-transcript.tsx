"use client";

/**
 * Bước 2 — Transcript: mỗi dòng `giây_bắt_đầu|giây_kết_thúc|nội dung`.
 * ValidateTranscript trả lỗi kèm SỐ DÒNG; nút "Tự tạo mốc giây" chuyển các
 * dòng văn bản thuần sang đúng định dạng bằng cách chia đều khoảng video.
 */
import { useMemo } from "react";
import { Button } from "@/components/ui";
import { validateTranscript } from "@/lib/content-fields";
import { Field, textareaCls } from "../form-bits";
import type { WizardData } from "./wizard-types";

const SAMPLE = `0|4|Hello and welcome to today's lesson.
4|9|First, let me introduce the topic we will cover.
9|15|Listen carefully and try to shadow each sentence.`;

function autoTimestamp(d: WizardData): string {
  const lines = d.transcript.split("\n").filter((l) => l.trim() !== "");
  const start = Number(d.startSeconds) || 0;
  const end = Number(d.endSeconds) || start + lines.length * 5;
  const span = Math.max(1, end - start);
  const slice = span / lines.length;
  return lines
    .map((l, i) => {
      const s = Math.floor(start + i * slice);
      const e = Math.max(s + 1, Math.floor(start + (i + 1) * slice));
      const text = l.includes("|") ? l.split("|").slice(2).join("|") : l;
      return `${s}|${e}|${text.trim()}`;
    })
    .join("\n");
}

export default function StepTranscript({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}) {
  const lineErrors = useMemo(
    () => validateTranscript(data.transcript),
    [data.transcript]
  );
  const hasPlainLines = useMemo(
    () =>
      data.transcript
        .split("\n")
        .some((l) => l.trim() !== "" && !l.includes("|")),
    [data.transcript]
  );

  return (
    <div className="space-y-4">
      <Field
        label="Transcript của video"
        hint='Mỗi dòng: giây_bắt_đầu|giây_kết_thúc|nội dung — vd "12|17|He works at the clinic."'
      >
        <textarea
          className={textareaCls}
          rows={12}
          spellCheck={false}
          placeholder={SAMPLE}
          value={data.transcript}
          onChange={(e) => onChange({ transcript: e.target.value })}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange({ transcript: SAMPLE })}
        >
          Chèn ví dụ mẫu
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!data.transcript.trim()}
          title="Chia đều khoảng bắt đầu–kết thúc cho từng dòng"
          onClick={() => onChange({ transcript: autoTimestamp(data) })}
        >
          ⏱ Tự tạo mốc giây
        </Button>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-indigo-600"
            checked={data.verifiedTranscript}
            onChange={(e) => onChange({ verifiedTranscript: e.target.checked })}
          />
          Transcript đã kiểm chứng
        </label>
      </div>
      {hasPlainLines && (
        <p className="text-xs text-amber-700">
          Có dòng chưa có mốc giây — bấm &quot;Tự tạo mốc giây&quot; để chuyển
          sang dạng start|end|text, rồi chỉnh lại cho khớp.
        </p>
      )}

      {data.transcript.trim() !== "" &&
        (lineErrors.length === 0 ? (
          <p className="text-sm text-emerald-700">
            ✓ Transcript hợp lệ (
            {data.transcript.split("\n").filter((l) => l.trim() !== "").length}{" "}
            dòng)
          </p>
        ) : (
          <ul
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 list-disc pl-6 space-y-0.5"
          >
            {lineErrors.slice(0, 10).map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
            {lineErrors.length > 10 && (
              <li>…và {lineErrors.length - 10} dòng lỗi khác</li>
            )}
          </ul>
        ))}
    </div>
  );
}
