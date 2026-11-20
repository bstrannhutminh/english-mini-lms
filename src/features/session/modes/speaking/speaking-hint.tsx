"use client";

import type { SessionData } from "../types";

/**
 * Gợi ý cấu trúc & từ khoá cho bài nói — mở khi bấm "Xin gợi ý" (shell đã
 * ghi event hint; server tính assisted). Ưu tiên feedbackGuide của bài;
 * fallback nhắc lại mục tiêu đã duyệt, không tạo tình huống hội nghị mới.
 */
export function SpeakingHint({ data }: { data: SessionData }) {
  const { activity } = data;
  return (
    <div>
      <div className="mb-2 font-semibold">Tiêu chí của bài nói này</div>
      <div className="leading-relaxed">
        {activity.feedbackGuide || activity.objective || "Đọc lại tình huống trong đề, chọn ý chính rồi nói bằng lời của bạn."}
      </div>
    </div>
  );
}
