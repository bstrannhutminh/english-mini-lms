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
      <p className="mb-2 font-semibold">Quy trình dịch đoạn y khoa</p>
      <ul className="list-disc space-y-1.5 pl-5">
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
        <p className="mt-3 border-t border-amber-200 pt-3">
          <strong>Tiêu chí chấm của bài này:</strong> {activity.feedbackGuide}
        </p>
      )}
    </div>
  );
}
