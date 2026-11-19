"use client";

/** Tạo/sửa segment — vị trí (trang/giây), text + transcript `start|end|text`. */
import { useMemo, useState } from "react";
import { Button, useToast } from "@/components/ui";
import type { AdminSegment, AdminSource } from "@/contracts/admin-content";
import type { FieldError } from "@/lib/content-constants";
import { validateTranscript } from "@/lib/content-fields";
import { createSegment, updateSegment } from "../admin-api";
import {
  ErrorList,
  Field,
  inputCls,
  textareaCls,
  toErrorState,
} from "../form-bits";

const orNull = (s: string) => (s.trim() === "" ? null : s);
const intOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

export default function SegmentEditForm({
  segment,
  sources,
  onSaved,
  onCancel,
}: {
  segment: AdminSegment | null;
  sources: AdminSource[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const isNew = segment === null;
  const [f, setF] = useState({
    id: segment?.id ?? "seg-",
    sourceId: segment?.sourceId ?? sources[0]?.id ?? "",
    page: segment?.page != null ? String(segment.page) : "",
    startSeconds: segment?.startSeconds != null ? String(segment.startSeconds) : "",
    endSeconds: segment?.endSeconds != null ? String(segment.endSeconds) : "",
    language: segment?.language ?? "en",
    verifiedTranscript: segment?.verifiedTranscript ?? false,
    textContent: segment?.textContent ?? "",
    transcriptContent: segment?.transcriptContent ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<FieldError[]>([]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const transcriptErrors = useMemo(
    () => validateTranscript(f.transcriptContent),
    [f.transcriptContent]
  );
  const sourceTitle =
    sources.find((s) => s.id === (isNew ? f.sourceId : segment.sourceId))?.title;

  async function save() {
    setSaving(true);
    setError(null);
    setDetails([]);
    const body: Record<string, unknown> = {
      page: intOrNull(f.page),
      startSeconds: intOrNull(f.startSeconds),
      endSeconds: intOrNull(f.endSeconds),
      language: orNull(f.language),
      verifiedTranscript: f.verifiedTranscript,
      textContent: orNull(f.textContent),
      transcriptContent: orNull(f.transcriptContent),
    };
    try {
      if (isNew) {
        await createSegment({ ...body, id: f.id.trim(), sourceId: f.sourceId });
      } else {
        await updateSegment(segment.id, body);
      }
      toast.success("Đã lưu segment", f.id);
      onSaved();
    } catch (err) {
      const e = toErrorState(err);
      setError(e.message);
      setDetails(e.fields);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4"
    >
      <h2 className="text-lg font-semibold text-slate-800">
        {isNew ? "＋ Segment mới" : `Sửa segment ${segment.id}`}{" "}
        <span className="text-sm font-normal text-slate-500">
          — nguồn {sourceTitle ?? (isNew ? f.sourceId : segment.sourceId)}
        </span>
      </h2>
      <ErrorList error={error} details={details} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Mã segment"
          hint={isNew ? "Dạng seg-ten-doan — không đổi được sau khi tạo" : "Không đổi được"}
        >
          <input
            className={inputCls}
            value={f.id}
            disabled={!isNew}
            onChange={(e) => set("id", e.target.value.toLowerCase())}
          />
        </Field>
        <Field label="Thuộc nguồn">
          <select
            className={inputCls}
            value={f.sourceId}
            disabled={!isNew}
            onChange={(e) => set("sourceId", e.target.value)}
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Trang (sách)" hint="để trống nếu là video">
          <input
            className={inputCls}
            inputMode="numeric"
            value={f.page}
            onChange={(e) => set("page", e.target.value)}
          />
        </Field>
        <Field label="Bắt đầu (giây)">
          <input
            className={inputCls}
            inputMode="numeric"
            value={f.startSeconds}
            onChange={(e) => set("startSeconds", e.target.value)}
          />
        </Field>
        <Field label="Kết thúc (giây)">
          <input
            className={inputCls}
            inputMode="numeric"
            value={f.endSeconds}
            onChange={(e) => set("endSeconds", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ngôn ngữ">
          <input
            className={inputCls}
            value={f.language}
            onChange={(e) => set("language", e.target.value)}
          />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 self-end">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-indigo-600"
            checked={f.verifiedTranscript}
            onChange={(e) => set("verifiedTranscript", e.target.checked)}
          />
          Transcript đã kiểm chứng
        </label>
      </div>

      <Field label="Văn bản (textContent)">
        <textarea
          className={textareaCls}
          rows={8}
          value={f.textContent}
          onChange={(e) => set("textContent", e.target.value)}
        />
      </Field>

      <Field
        label="Transcript (mỗi dòng start|end|text)"
        error={transcriptErrors[0]?.message}
      >
        <textarea
          className={textareaCls}
          rows={8}
          value={f.transcriptContent}
          onChange={(e) => set("transcriptContent", e.target.value)}
        />
      </Field>
      {transcriptErrors.length > 1 && (
        <ul className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 list-disc pl-6 space-y-0.5">
          {transcriptErrors.slice(1).map((e, i) => (
            <li key={i}>{e.message}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 pt-2 sticky bottom-0 bg-white/95 py-3 border-t">
        <Button
          type="submit"
          variant="primary"
          loading={saving}
          disabled={transcriptErrors.length > 0}
        >
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
