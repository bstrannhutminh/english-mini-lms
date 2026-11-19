"use client";

/**
 * TodayErrorCard — lỗi tải /api/v1/today: thông báo tiếng Việt + nút Thử lại
 * (invariant: không trang trắng, luôn có đường thử lại).
 */
import { Button, Icon } from "@/components/ui";

export interface TodayErrorCardProps {
  message: string;
  onRetry: () => void;
}

export function TodayErrorCard({ message, onRetry }: TodayErrorCardProps) {
  return (
    <div
      role="alert"
      className="flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-5 shadow-xs sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-3">
        <Icon
          name="alert-triangle"
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
        />
        <div>
          <h3 className="text-sm font-bold text-red-900">
            Không thể tải gợi ý bài học hôm nay
          </h3>
          <p className="mt-0.5 text-xs text-red-700">{message}</p>
        </div>
      </div>
      <Button
        variant="danger"
        size="md"
        onClick={onRetry}
        className="shrink-0"
      >
        <Icon name="refresh" className="h-3.5 w-3.5" />
        <span>Thử lại</span>
      </Button>
    </div>
  );
}
