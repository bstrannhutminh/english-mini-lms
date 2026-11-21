"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { updateSubmissionResponseSchema } from "@/contracts/submission";
import { Button, Icon, useToast } from "@/components/ui";
import { StructuredBody } from "./structured-body";
import type { SubmissionDetail } from "../types";
import { modeSkill } from "@/lib/modes";

interface SubmissionPanelProps {
  submission: SubmissionDetail;
  activityMode: string;
}

/**
 * Nội dung bài đã nộp: trình phát audio (signed URL) + văn bản/transcript.
 * Bài nói (audio) có thể "Chỉnh sửa / Xác nhận" transcript — PATCH chỉ gửi
 * confirmed_transcript (append-only: body bài nộp không bao giờ đổi).
 */
export function SubmissionPanel({ submission, activityMode }: SubmissionPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const isAudio = submission.modality === "audio" || modeSkill(activityMode) === "speaking";

  const initialText = submission.confirmedTranscript || submission.body || "";
  const [draft, setDraft] = useState(initialText);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSaveTranscript() {
    if (saving) return;
    setSaving(true);
    try {
      await apiFetch(
        `/api/v1/submissions/${submission.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmed_transcript: draft }),
        },
        updateSubmissionResponseSchema
      );
      setEditing(false);
      toast.success("Đã cập nhật transcript làm bằng chứng học tập!");
      router.refresh();
    } catch (err) {
      toast.error(
        "Không thể lưu transcript đã xác nhận",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {submission.audioUrl ? (
        <section>
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <Icon name="headphones" className="h-4 w-4" />
            Bản ghi âm của bạn
          </p>
          <audio controls src={submission.audioUrl} className="h-11 w-full" />
        </section>
      ) : null}

      <section>
        <p className="eyebrow mb-2">
          {isAudio ? "Transcript bài nói" : "Nội dung bài nộp"}
        </p>

        {isAudio && editing ? (
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              disabled={saving}
              aria-label="Transcript đã xác nhận"
              className="field-control w-full rounded-xl border border-border-strong px-3.5 py-3 text-base leading-relaxed text-text"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(initialText);
                  setEditing(false);
                }}
                disabled={saving}
              >
                Huỷ
              </Button>
              <Button size="sm" onClick={handleSaveTranscript} loading={saving}>
                Lưu transcript đã xác nhận
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="max-w-prose whitespace-pre-wrap text-base leading-relaxed text-text">
              <StructuredBody body={draft || submission.body} />
            </div>
            {isAudio ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3">
                <span className="min-w-0 flex-1 basis-56 text-base leading-relaxed text-text-secondary">
                  Bác sĩ có thể chỉnh sửa các thuật ngữ chuyên ngành AI nhận diện
                  chưa chuẩn.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Icon name="pen" className="h-3.5 w-3.5" />
                  Chỉnh sửa / Xác nhận
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
