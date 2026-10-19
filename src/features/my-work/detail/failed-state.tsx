"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { retryAssessmentResponseSchema } from "@/contracts/submission";
import { Button, Card, Icon, useToast } from "@/components/ui";

interface FailedStateProps {
  assessmentId: string;
  /** resultRef — thông điệp lỗi server ghi lại khi chấm hỏng. */
  resultRef: string | null;
}

/** Banner "chấm lỗi" + nút Chấm lại (POST /assessments/[id]/retry). */
export function FailedState({ assessmentId, resultRef }: FailedStateProps) {
  const router = useRouter();
  const toast = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await apiFetch(
        `/api/v1/assessments/${assessmentId}/retry`,
        { method: "POST" },
        retryAssessmentResponseSchema
      );
      toast.success("Đã chấm lại xong — đang tải kết quả mới.");
      router.refresh();
    } catch (err) {
      toast.error(
        "Chấm lại thất bại",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <Card className="mb-4 border-red-200 bg-red-50">
      <p className="flex items-center gap-2 text-sm font-bold text-red-900">
        <Icon name="alert-triangle" className="h-4 w-4" />
        Không thể hoàn tất chấm điểm với Gemini
      </p>
      <p className="mt-1 text-sm text-red-800">
        {resultRef || "Quá thời gian kết nối hoặc Gemini phản hồi không hợp lệ."}
      </p>
      <div className="mt-3">
        <Button
          variant="danger"
          size="sm"
          onClick={handleRetry}
          loading={isRetrying}
        >
          <Icon name="refresh" className="h-4 w-4" />
          {isRetrying ? "Đang chấm lại…" : "Chấm lại ngay"}
        </Button>
      </div>
    </Card>
  );
}
