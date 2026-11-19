"use client";

/**
 * InsufficientDataBanner — cảnh báo trung thực khi chưa đủ bằng chứng
 * (< 3 bài nộp): không vẽ xu hướng từ dữ liệu ít (invariant).
 */
import { Icon } from "@/components/ui";

export function InsufficientDataBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <Icon
        name="info"
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
      />
      <div>
        <h3 className="text-xs font-bold text-amber-900 sm:text-sm">
          Chưa đủ bằng chứng để phân tích xu hướng
        </h3>
        <p className="mt-0.5 text-xs text-amber-700">
          Hệ thống cần tối thiểu 3 bài làm để bắt đầu nhận diện mẫu lỗi lặp và
          so sánh độ tiến bộ. Hãy tiếp tục luyện tập thêm các bài trong Thư
          viện!
        </p>
      </div>
    </div>
  );
}
