"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { updateSubmissionResponseSchema } from "@/contracts/submission";
import { Button, Card, Icon, useToast } from "@/components/ui";
import { StructuredBody } from "./structured-body";
import type { SubmissionDetail } from "../types";

interface SubmissionPanelProps {
  submission: SubmissionDetail;
  activityMode: string;
}

/**
 * Cột trái trang chi tiết: trình phát audio (signed URL) + nội dung bài nộp.
 * Bài nói (audio) có thể "Chỉnh sửa / Xác nhận" transcript — PATCH chỉ gửi
 * confirmed_transcript (append-only: body bài nộp không bao giờ đổi).
 */
export function SubmissionPanel({ submission, activityMode }: SubmissionPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const isAudio = submission.modality === "audio" || activityMode === "speaking";

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
    <div>
      {submission.audioUrl ? (
        <Card className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-text">
              <Icon name="headphones" className="h-4 w-4 text-teal-700" />
              Bản ghi âm của bạn
            </p>
            <span className="text-xs text-text-muted">
              Bảo mật · Signed URL (10 phút)
            </span>
          </div>
          <audio controls src={submission.audioUrl} className="h-10 w-full" />
        </Card>
      ) : null}

      <Card className="mb-4">
        <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-text-secondary">
          {isAudio ? "Transcript bài nói" : "Nội dung bài nộp"}
        </p>

        {isAudio && editing ? (
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              aria-label="Transcript đã xác nhận"
              className="w-full rounded-lg border border-teal-600 px-3 py-2.5 text-sm leading-relaxed text-text outline-none focus:ring-2 focus:ring-teal-200"
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
            <div className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-surface-muted p-4 text-base leading-relaxed text-text">
              <StructuredBody body={draft || submission.body} />
            </div>
            {isAudio ? (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-text-muted">
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
      </Card>
    </div>
  );
}
