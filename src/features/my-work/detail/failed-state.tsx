"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { retryAssessmentResponseSchema } from "@/contracts/submission";
import { Button, Icon, useToast } from "@/components/ui";

interface FailedStateProps {
  assessmentId: string;
  /** resultRef — thông điệp lỗi server ghi lại khi chấm hỏng. */
  resultRef: string | null;
}

/** Thẻ "chấm lỗi": trấn an bài vẫn được lưu + nút chính Chấm lại (POST /assessments/[id]/retry). */
export function FailedState({ assessmentId, resultRef }: FailedStateProps) {
  const router = useRouter();
  const toast = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  async function handleRetry() {
    if (isRetrying) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      await apiFetch(
        `/api/v1/assessments/${assessmentId}/retry`,
        { method: "POST" },
        retryAssessmentResponseSchema
      );
      toast.success("Đã chấm lại xong — đang tải kết quả mới.");
      router.refresh();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Chưa chấm lại được. Hãy thử lại khi có kết nối.");
      toast.error(
        "Chấm lại thất bại",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <section role="status" className="rounded-2xl border border-red-200 bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
          <Icon name="alert-triangle" className="h-5 w-5" />
        </span>
        <h2 className="min-w-0 text-lg font-semibold leading-snug text-text">Bài đã lưu, nhưng chưa có góp ý</h2>
      </div>

      <div className="mt-3 sm:pl-[52px]">
        <p className="text-base leading-relaxed text-text-secondary">
          Lần chấm vừa rồi không hoàn tất. Bài nộp vẫn được giữ nguyên — chỉ cần chấm lại để nhận góp ý.
        </p>
        <Button size="lg" onClick={handleRetry} loading={isRetrying} className="mt-4 w-full sm:w-auto">
          {isRetrying ? null : <Icon name="refresh" className="h-4 w-4" />}
          {isRetrying ? "Đang chấm lại…" : "Chấm lại ngay"}
        </Button>
        {retryError ? (
          <p role="alert" className="mt-3 text-base text-red-800">{retryError}</p>
        ) : null}
        <p className="mt-4 break-words border-t border-border pt-3 text-base leading-relaxed text-text-muted">
          <span className="font-medium text-text-secondary">Chi tiết lỗi: </span>
          {resultRef || "Quá thời gian kết nối hoặc Gemini phản hồi không hợp lệ."}
        </p>
      </div>
    </section>
  );
}
