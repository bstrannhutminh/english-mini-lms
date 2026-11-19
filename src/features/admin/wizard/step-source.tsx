"use client";

/** Bước 1 — Nguồn: link YouTube + mốc giây + tiêu đề + id tự gợi ý. */
import { isYouTubeUrl } from "@/lib/content-fields";
import { Field, inputCls } from "../form-bits";
import {
  suggestActivityId,
  suggestSegmentId,
  suggestSourceId,
  type WizardData,
} from "./wizard-types";

export default function StepSource({
  data,
  existingActivityIds,
  onChange,
}: {
  data: WizardData;
  existingActivityIds: string[];
  onChange: (patch: Partial<WizardData>) => void;
}) {
  const url = data.youtubeUrl.trim();
  const urlOk = url === "" ? null : isYouTubeUrl(url);

  function autoFillIds(title: string) {
    if (data.idsTouched) return;
    const sourceId = suggestSourceId(title);
    onChange({
      sourceId,
      segmentId: suggestSegmentId(sourceId),
      activityId: suggestActivityId(data.mode, existingActivityIds),
    });
  }

  return (
    <div className="space-y-4">
      <Field
        label="Link YouTube của bài nghe"
        hint="Dán link watch?v=… hoặc youtu.be/… (video id đúng 11 ký tự)"
        error={urlOk === false ? "Link YouTube chưa đúng định dạng" : undefined}
      >
        <input
          className={inputCls}
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=…"
          value={data.youtubeUrl}
          onChange={(e) => onChange({ youtubeUrl: e.target.value })}
        />
      </Field>
      {urlOk && (
        <p className="text-sm text-emerald-700">✓ Link YouTube hợp lệ</p>
      )}

      <Field label="Tiêu đề bài học">
        <input
          className={inputCls}
          placeholder="VD: Phỏng vấn bác sĩ về chuyển khoa"
          value={data.title}
          onChange={(e) => {
            onChange({ title: e.target.value });
            autoFillIds(e.target.value);
          }}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bắt đầu từ giây" hint="Để trống = từ đầu video">
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="0"
            value={data.startSeconds}
            onChange={(e) => onChange({ startSeconds: e.target.value })}
          />
        </Field>
        <Field label="Kết thúc ở giây" hint="Để trống = hết video">
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="120"
            value={data.endSeconds}
            onChange={(e) => onChange({ endSeconds: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Dạng bài">
          <select
            className={inputCls}
            value={data.mode}
            onChange={(e) => {
              const mode = e.target.value as WizardData["mode"];
              onChange({
                mode,
                ...(data.idsTouched
                  ? {}
                  : { activityId: suggestActivityId(mode, existingActivityIds) }),
              });
            }}
          >
            <option value="listening">Nghe / Shadowing</option>
            <option value="ielts-listening">Nghe IELTS</option>
          </select>
        </Field>
        <Field label="Thời lượng (phút)" hint="tuỳ chọn">
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="10"
            value={data.durationMinutes}
            onChange={(e) => onChange({ durationMinutes: e.target.value })}
          />
        </Field>
        <Field label="Chủ đề" hint="tuỳ chọn — vd luyen-ielts">
          <input
            className={inputCls}
            value={data.topic}
            placeholder="giao-tiep-lam-sang"
            onChange={(e) => onChange({ topic: e.target.value })}
          />
        </Field>
      </div>

      <details className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-600">
          Mã định danh (tự tạo — chỉnh khi cần)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Mã bài" hint="L5 / IL5">
            <input
              className={inputCls}
              value={data.activityId}
              onChange={(e) =>
                onChange({ activityId: e.target.value.toUpperCase(), idsTouched: true })
              }
            />
          </Field>
          <Field label="Mã nguồn">
            <input
              className={inputCls}
              value={data.sourceId}
              onChange={(e) =>
                onChange({ sourceId: e.target.value.toLowerCase(), idsTouched: true })
              }
            />
          </Field>
          <Field label="Mã segment">
            <input
              className={inputCls}
              value={data.segmentId}
              onChange={(e) =>
                onChange({ segmentId: e.target.value.toLowerCase(), idsTouched: true })
              }
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
