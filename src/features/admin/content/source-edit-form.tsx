"use client";

/** Tạo/sửa nguồn — nhãn Việt, "Lưu trữ" thay cho xoá. */
import { useState } from "react";
import { Button, useToast } from "@/components/ui";
import type { AdminSource } from "@/contracts/admin-content";
import {
  LOCATOR_TYPES,
  SOURCE_KINDS,
  type FieldError,
} from "@/lib/content-constants";
import { isYouTubeUrl } from "@/lib/content-fields";
import { createSource, updateSource } from "../admin-api";
import {
  ErrorList,
  Field,
  inputCls,
  textareaCls,
  toErrorState,
} from "../form-bits";
import { REVIEW_STATE_OPTIONS } from "../labels";

const orNull = (s: string) => (s.trim() === "" ? null : s.trim());
const KIND_LABEL: Record<string, string> = {
  book: "Sách",
  video: "Video",
  audio: "Audio",
  article: "Bài báo",
  "self-authored": "Tự soạn",
};
const LOCATOR_LABEL: Record<string, string> = {
  page: "Trang",
  seconds: "Giây",
};

export default function SourceEditForm({
  source,
  onSaved,
  onCancel,
}: {
  source: AdminSource | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const isNew = source === null;
  const [f, setF] = useState({
    id: source?.id ?? "src-",
    title: source?.title ?? "",
    kind: source?.kind ?? "video",
    permission: source?.permission ?? "",
    locatorType: source?.locatorType ?? "",
    url: source?.url ?? "",
    notes: source?.notes ?? "",
    reviewState: source?.reviewState ?? "draft",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<FieldError[]>([]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const urlBad = f.kind === "video" && f.url.trim() !== "" && !isYouTubeUrl(f.url.trim());

  async function save() {
    setSaving(true);
    setError(null);
    setDetails([]);
    const body: Record<string, unknown> = {
      title: f.title.trim(),
      kind: f.kind,
      permission: orNull(f.permission),
      locatorType: f.locatorType || null,
      url: orNull(f.url),
      notes: orNull(f.notes),
    };
    try {
      if (isNew) {
        await createSource({ ...body, id: f.id.trim() });
      } else {
        await updateSource(source.id, { ...body, reviewState: f.reviewState });
      }
      toast.success("Đã lưu nguồn", f.id);
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
        {isNew ? "＋ Nguồn mới (Nháp)" : `Sửa nguồn ${source.id}`}
      </h2>
      <ErrorList error={error} details={details} />

      <Field
        label="Mã nguồn"
        hint={isNew ? "Dạng src-ten-nguon — không đổi được sau khi tạo" : "Không đổi được"}
      >
        <input
          className={inputCls}
          value={f.id}
          disabled={!isNew}
          onChange={(e) => set("id", e.target.value.toLowerCase())}
        />
      </Field>

      <Field label="Tiêu đề">
        <input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loại nguồn">
          <select className={inputCls} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
            {SOURCE_KINDS.map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k] ?? k}</option>
            ))}
          </select>
        </Field>
        <Field label="Định vị theo">
          <select className={inputCls} value={f.locatorType} onChange={(e) => set("locatorType", e.target.value)}>
            <option value="">—</option>
            {LOCATOR_TYPES.map((l) => (
              <option key={l} value={l}>{LOCATOR_LABEL[l] ?? l}</option>
            ))}
          </select>
        </Field>
        <Field label="Quyền sử dụng">
          <input
            className={inputCls}
            value={f.permission}
            placeholder="personal-study, public-embed…"
            onChange={(e) => set("permission", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="URL"
        hint={f.kind === "video" ? "Link YouTube hợp lệ" : "Link http(s), có thể để trống"}
        error={urlBad ? "Nguồn video cần link YouTube hợp lệ" : undefined}
      >
        <input className={inputCls} inputMode="url" value={f.url} onChange={(e) => set("url", e.target.value)} />
      </Field>

      <Field label="Ghi chú">
        <textarea className={textareaCls} rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>

      {!isNew && (
        <Field label="Trạng thái" hint='"Lưu trữ" = gỡ nguồn, không xoá dữ liệu.'>
          <select className={inputCls} value={f.reviewState} onChange={(e) => set("reviewState", e.target.value as typeof f.reviewState)}>
            {REVIEW_STATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      )}

      <div className="flex flex-wrap gap-2 pt-2 sticky bottom-0 bg-white/95 py-3 border-t">
        <Button type="submit" variant="primary" loading={saving} disabled={f.title.trim() === ""}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
