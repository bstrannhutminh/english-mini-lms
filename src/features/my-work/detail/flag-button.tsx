"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { feedbackReviewResponseSchema } from "@/contracts/submission";
import { Button, Icon, Modal, useToast } from "@/components/ui";

interface FlagButtonProps {
  /** feedback_versions.id — bắt buộc để gọi API; ẩn nút khi thiếu. */
  feedbackId?: string;
  /** Index observation trong mảng (để server đánh dấu đúng điểm). */
  observationIndex: number;
  /** Đã gắn cờ rồi (từ DB hoặc sau khi flag thành công). */
  flagged?: boolean;
  /** Callback khi flag thành công — cha cập nhật UI cục bộ. */
  onFlagged?: (index: number) => void;
}

/**
 * "Tôi không đồng ý" — mở Modal nhập lý do rồi POST /feedback/[id]/flag.
 * Server đặt review_state=under_review trên feedback_versions (giữ nguyên
 * version, không xoá nhận xét). Thay prompt()/alert() cũ bằng Modal+Toast.
 */
export function FlagButton({
  feedbackId,
  observationIndex,
  flagged = false,
  onFlagged,
}: FlagButtonProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  if (!feedbackId) return null;

  if (flagged) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
        <Icon name="flag" className="h-3 w-3" />
        Đã gắn cờ để rà soát
      </span>
    );
  }

  async function handleSubmit() {
    if (sending || !feedbackId) return;
    setSending(true);
    try {
      await apiFetch(
        `/api/v1/feedback/${feedbackId}/flag`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            observationIndex,
            reason: reason.trim() || undefined,
          }),
        },
        feedbackReviewResponseSchema
      );
      setOpen(false);
      onFlagged?.(observationIndex);
      toast.success(
        "Đã gắn cờ nhận xét",
        "Quản trị viên sẽ rà soát lại góp ý này."
      );
    } catch (err) {
      toast.error(
        "Không gửi được phản ánh",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Bấm nếu bạn thấy nhận xét của AI chưa chuẩn xác hoặc máy móc"
        className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-text-muted transition hover:border-amber-400 hover:text-amber-800"
      >
        <Icon name="flag" className="h-3 w-3" />
        Tôi không đồng ý
      </button>

      <Modal
        open={open}
        onClose={sending ? undefined : () => setOpen(false)}
        title="Bạn không đồng ý với nhận xét này?"
        description="Nhận xét sẽ được gắn cờ để quản trị viên rà soát lại — nội dung góp ý vẫn được giữ nguyên."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
              className="w-full sm:w-auto"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSubmit}
              loading={sending}
              className="w-full sm:w-auto"
            >
              Gắn cờ nhận xét
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-text">
          Lý do (không bắt buộc)
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ví dụ: nhận xét chưa đúng ngữ cảnh y khoa, câu gốc đã đúng ngữ pháp…"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-text outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </Modal>
    </>
  );
}
