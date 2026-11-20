"use client";

import { useState } from "react";
import { z } from "zod";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { modeMeta } from "@/lib/modes";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  useToast,
} from "@/components/ui";
import type { SettingsSubmission } from "@/contracts/settings";

const deleteResponseSchema = z.looseObject({ success: z.literal(true) });

interface SubmissionsCardProps {
  submissions: SettingsSubmission[];
  onDeleted: (id: string) => void;
}

/**
 * Danh sách bài nộp + xoá mềm theo yêu cầu (ConfirmDialog thay confirm()).
 * Xoá mềm khỏi tiến độ; việc dọn tệp âm thanh được xử lý riêng.
 */
export function SubmissionsCard({ submissions, onDeleted }: SubmissionsCardProps) {
  const toast = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pending = submissions.find((s) => s.id === pendingId) ?? null;

  async function handleDelete() {
    if (!pendingId) return;
    try {
      setDeleting(true);
      await apiFetch(
        `/api/v1/submissions/${pendingId}`,
        { method: "DELETE" },
        deleteResponseSchema
      );
      onDeleted(pendingId);
      setPendingId(null);
      toast.success("Đã xoá bài làm.");
    } catch (err) {
      toast.error(
        "Không thể xoá bài",
        err instanceof ApiClientError ? err.message : undefined
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Quản lý và xoá bài làm theo yêu cầu"
        description="Ẩn bài khỏi tiến độ và danh sách bài làm. Lịch sử bản sửa vẫn được giữ trong hệ thống."
      />

      {submissions.length === 0 ? (
        <EmptyState
          title="Chưa có bài nộp nào"
          description="Bài bạn nộp trong các phiên học sẽ xuất hiện ở đây."
        />
      ) : (
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto pr-1">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-3 py-3 text-base"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">
                  {sub.activityTitle}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-base text-slate-500">
                  <Badge tone={modeMeta(sub.activityMode).tone}>
                    {modeMeta(sub.activityMode).label}
                  </Badge>
                  <span>
                    {new Date(sub.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {sub.mediaId && (
                    <Badge tone="neutral">🎙️ Audio</Badge>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingId(sub.id)}
                className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Xoá
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Xoá bài làm này?"
        description={
          pending
            ? `“${pending.activityTitle}” sẽ được ẩn khỏi tiến độ. Lịch sử bản sửa vẫn được giữ. Ứng dụng sẽ thử xóa âm thanh đi kèm; màn hình này chưa xác nhận được kết quả xóa tệp.`
            : undefined
        }
        confirmLabel="Xoá bài"
        cancelLabel="Giữ lại"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingId(null)}
      />
    </Card>
  );
}
