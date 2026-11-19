"use client";

import { Button, Card, Spinner } from "@/components/ui";
import { useAssessmentPolling } from "./use-assessment-polling";

interface PendingStateProps {
  status: string; // "queued" | "processing"
}

/**
 * Banner "chờ chấm" — tự cập nhật (poll router.refresh 6s) khi assessment
 * đang queued/processing. Hết ~5 phút mà chưa xong → báo chậm + nút làm mới tay.
 */
export function PendingState({ status }: PendingStateProps) {
  const { polling, timedOut, refresh } = useAssessmentPolling(status);

  return (
    <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 border-emerald-200 bg-emerald-50">
      <div className="flex items-center gap-3">
        <Spinner size="md" label="Đang chờ chấm" className="text-emerald-700" />
        <div>
          <p className="text-sm font-bold text-emerald-900">
            Đang chờ chấm điểm từ AI…
          </p>
          <p className="mt-0.5 text-xs text-emerald-800">
            {status === "queued"
              ? "Bài nộp đã vào hàng đợi xử lý của hệ thống."
              : "Gemini đang phân tích bài làm và chấm điểm theo rubric."}
            {polling ? " Trang sẽ tự cập nhật vài giây một lần." : ""}
          </p>
          {timedOut ? (
            <p className="mt-1 text-xs font-medium text-amber-800">
              Việc chấm đang lâu hơn bình thường — bạn có thể làm mới tay hoặc
              quay lại sau.
            </p>
          ) : null}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={refresh}
        className="border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100"
      >
        Làm mới kết quả
      </Button>
    </Card>
  );
}
