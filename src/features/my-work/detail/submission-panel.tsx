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
  /** Transcript do AI bóc băng (từ feedback) — làm điểm khởi đầu khi learner
   * bấm "Chỉnh sửa / Xác nhận", thay vì bắt đầu từ ghi chú trống/ngắn. */
  aiTranscript?: string | null;
}

/**
 * Nội dung bài đã nộp: trình phát audio (signed URL) + văn bản do LEARNER
 * viết (ghi chú/bản gõ tay — KHÔNG phải transcript AI; transcript AI hiển thị
 * riêng trong khối góp ý). Bài nói (audio) có thể "Chỉnh sửa / Xác nhận"
 * transcript — PATCH chỉ gửi confirmed_transcript (append-only: body bài nộp
 * không bao giờ đổi).
 */
export function SubmissionPanel({ submission, activityMode, aiTranscript }: SubmissionPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const isAudio = submission.modality === "audio" || modeSkill(activityMode) === "speaking";

  // Hiển thị: văn bản của learner (confirmed transcript nếu đã xác nhận,
  // không thì ghi chú/bản gõ tay lúc nộp). Chỉnh sửa: ưu tiên confirmed →
  // transcript AI (để sửa lỗi nhận diện) → body.
  const displayText = submission.confirmedTranscript || submission.body || "";
  const editStartText =
    submission.confirmedTranscript || aiTranscript || submission.body || "";
  const [draft, setDraft] = useState(displayText);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionLabel = !isAudio
    ? "Nội dung bài nộp"
    : submission.confirmedTranscript
      ? "Transcript bạn đã xác nhận"
      : "Ghi chú / bản gõ tay của bạn";

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
        <p className="eyebrow mb-2">{sectionLabel}</p>

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
                  setDraft(displayText);
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
              {displayText ? (
                <StructuredBody body={displayText} />
              ) : (
                <p className="text-text-muted">
                  {isAudio
                    ? "Bài này nộp bằng ghi âm, không kèm ghi chú văn bản."
                    : "Bài nộp không có nội dung văn bản."}
                </p>
              )}
            </div>
            {isAudio ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3">
                <span className="min-w-0 flex-1 basis-56 text-base leading-relaxed text-text-secondary">
                  {aiTranscript && !submission.confirmedTranscript
                    ? "Bấm chỉnh sửa để bắt đầu từ transcript AI nghe được và sửa các thuật ngữ chuyên ngành AI nhận diện chưa chuẩn."
                    : "Bác sĩ có thể chỉnh sửa các thuật ngữ chuyên ngành AI nhận diện chưa chuẩn."}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(editStartText);
                    setEditing(true);
                  }}
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
