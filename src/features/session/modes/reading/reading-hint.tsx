"use client";

import type { SessionData } from "../types";

/**
 * Gợi ý cách làm bài đọc–dịch — mở khi bấm "Xin gợi ý" (shell đã ghi event
 * hint; server tính assisted). Hiển thị thêm feedbackGuide của bài nếu có.
 */
export function ReadingHint({ data }: { data: SessionData }) {
  const { activity } = data;
  return (
    <div>
      <div className="mb-1 font-bold">💡 Gợi ý quy trình dịch đoạn y khoa:</div>
      <ul className="mb-1.5 list-disc pl-5">
        <li>
          <strong>Bước 1 — Đọc lướt:</strong> đọc cả đoạn một lần, gạch ý chính
          trước khi dịch từng câu.
        </li>
        <li>
          <strong>Bước 2 — Dịch theo cụm nghĩa:</strong> không dịch từng từ;
          giữ đúng thuật ngữ giải phẫu/can thiệp, ưu tiên độ trung thành.
        </li>
        <li>
          <strong>Bước 3 — Đọc lại bản dịch:</strong> kiểm tra câu tiếng Việt có
          tự nhiên, đủ ý so với đoạn gốc không.
        </li>
      </ul>
      {activity.feedbackGuide && (
        <div className="mt-1 border-t border-yellow-200 pt-1.5">
          <strong>Tiêu chí chấm của bài này:</strong> {activity.feedbackGuide}
        </div>
      )}
    </div>
  );
}
