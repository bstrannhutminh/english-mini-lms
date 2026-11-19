"use client";

/**
 * Sửa bài học hiện có — mọi nhãn tiếng Việt (MODE_META + REVIEW_STATE_META),
 * câu hỏi nghe sửa bằng form có cấu trúc (không JSON thô).
 * Chỉ sửa — tạo bài mới đi qua wizard "Bài nghe YouTube".
 */
import { useState } from "react";
import { Button, useToast } from "@/components/ui";
import type {
  AdminActivity,
  AdminSegment,
  AdminSource,
} from "@/contracts/admin-content";
import {
  ANSWER_REVEALS,
  DIFFICULTIES,
  OUTPUTS,
  PURPOSES,
  type FieldError,
} from "@/lib/content-constants";
import { modeMeta, modeSkill } from "@/lib/modes";
import { updateActivity } from "../admin-api";
import { ErrorList, Field, inputCls, textareaCls, toErrorState } from "../form-bits";
import {
  DIFFICULTY_LABEL,
  OUTPUT_LABEL,
  PURPOSE_LABEL,
  REVEAL_LABEL,
  REVIEW_STATE_OPTIONS,
} from "../labels";
import QuestionsFields, { questionsToDrafts } from "../questions-fields";
import SegmentPicker from "./segment-picker";

const orNull = (s: string) => (s.trim() === "" ? null : s);

export default function ActivityEditForm({
  activity,
  segments,
  sources,
  onSaved,
  onCancel,
}: {
  activity: AdminActivity;
  segments: AdminSegment[];
  sources: AdminSource[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [f, setF] = useState(() => ({
    title: activity.title,
    objective: activity.objective ?? "",
    topic: activity.topic ?? "",
    durationMinutes:
      activity.durationMinutes != null ? String(activity.durationMinutes) : "",
    difficulty: activity.difficulty ?? "trial",
    purpose: activity.purpose ?? "",
    reviewState: activity.reviewState,
    output: activity.output ?? "text",
    answerReveal: activity.answerReveal ?? "none",
    promptText: activity.promptText ?? "",
    feedbackGuide: activity.feedbackGuide ?? "",
    segmentIds: activity.segmentIds ?? [],
    questions: questionsToDrafts(
      Array.isArray(activity.questions) ? activity.questions : []
    ),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<FieldError[]>([]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));
  const isListening = modeSkill(activity.mode) === "listening";
  const meta = modeMeta(activity.mode);
  const usesFileQuestions =
    activity.questions == null && !!activity.questionsFile;
  const [replaceFileQuestions, setReplaceFileQuestions] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setDetails([]);
    const payload: Record<string, unknown> = {
      title: f.title.trim(),
      objective: orNull(f.objective),
      topic: f.topic.trim() || null,
      durationMinutes: f.durationMinutes.trim() === "" ? null : Number(f.durationMinutes),
      difficulty: f.difficulty,
      purpose: f.purpose || null,
      output: f.output,
      answerReveal: f.answerReveal,
      promptText: orNull(f.promptText),
      feedbackGuide: orNull(f.feedbackGuide),
      segmentIds: f.segmentIds,
      reviewState: f.reviewState,
    };
    if (isListening && (!usesFileQuestions || replaceFileQuestions)) {
      payload.questions = f.questions.map((q) => ({
        id: q.id.trim(),
        prompt: q.prompt.trim(),
        options: q.options.map((o) => ({ id: o.id.trim(), text: o.text.trim() })),
        correct_option_id: q.correctOptionId.trim(),
        ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
        ...(q.timestampRef.trim() !== "" && !Number.isNaN(Number(q.timestampRef))
          ? { timestamp_reference: Number(q.timestampRef) }
          : {}),
      }));
    }
    try {
      await updateActivity(activity.id, payload);
      toast.success("Đã lưu bài học", activity.id);
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
        Sửa bài {activity.id}{" "}
        <span className="text-sm font-normal text-slate-500">
          ({meta.label}
          {meta.isIelts ? " · IELTS" : ""})
        </span>
      </h2>
      <ErrorList error={error} details={details} />

      <Field label="Tiêu đề">
        <input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Mục tiêu">
        <input className={inputCls} value={f.objective} onChange={(e) => set("objective", e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Thời lượng (phút)">
          <input
            className={inputCls}
            inputMode="numeric"
            value={f.durationMinutes}
            onChange={(e) => set("durationMinutes", e.target.value)}
          />
        </Field>
        <Field label="Độ khó">
          <select className={inputCls} value={f.difficulty} onChange={(e) => set("difficulty", e.target.value as typeof f.difficulty)}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABEL[d] ?? d}</option>
            ))}
          </select>
        </Field>
        <Field label="Chủ đề">
          <input className={inputCls} value={f.topic} placeholder="slug, vd luyen-ielts" onChange={(e) => set("topic", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Mục đích">
          <select className={inputCls} value={f.purpose} onChange={(e) => set("purpose", e.target.value)}>
            <option value="">—</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{PURPOSE_LABEL[p] ?? p}</option>
            ))}
          </select>
        </Field>
        <Field label="Đầu ra">
          <select className={inputCls} value={f.output} onChange={(e) => set("output", e.target.value)}>
            {OUTPUTS.map((o) => (
              <option key={o} value={o}>{OUTPUT_LABEL[o] ?? o}</option>
            ))}
          </select>
        </Field>
        <Field label="Hiện đáp án">
          <select className={inputCls} value={f.answerReveal} onChange={(e) => set("answerReveal", e.target.value as typeof f.answerReveal)}>
            {ANSWER_REVEALS.map((r) => (
              <option key={r} value={r}>{REVEAL_LABEL[r] ?? r}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Đề bài / hướng dẫn">
        <textarea className={textareaCls} rows={8} value={f.promptText} onChange={(e) => set("promptText", e.target.value)} />
      </Field>
      <Field label="Hướng dẫn chấm / phản hồi">
        <textarea className={textareaCls} rows={4} value={f.feedbackGuide} onChange={(e) => set("feedbackGuide", e.target.value)} />
      </Field>

      <SegmentPicker segments={segments} sources={sources} selected={f.segmentIds} onChange={(ids) => set("segmentIds", ids)} />

      {isListening && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Câu hỏi nghe</span>
          {usesFileQuestions && !replaceFileQuestions ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Bài này đang dùng câu hỏi từ file <code>{activity.questionsFile}</code>.{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => setReplaceFileQuestions(true)}
              >
                Thay bằng câu hỏi nhập tay
              </button>
            </div>
          ) : (
            <QuestionsFields value={f.questions} onChange={(qs) => set("questions", qs)} />
          )}
        </div>
      )}

      <Field
        label="Trạng thái"
        hint='"Lưu trữ" = gỡ bài khỏi thư viện (không xoá). Chọn "Đã duyệt" sẽ được server kiểm tra đủ nội dung.'
      >
        <select className={inputCls} value={f.reviewState} onChange={(e) => set("reviewState", e.target.value as typeof f.reviewState)}>
          {REVIEW_STATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

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
