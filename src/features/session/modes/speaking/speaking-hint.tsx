"use client";

import type { SessionData } from "../types";

/**
 * Gợi ý cấu trúc & từ khoá cho bài nói — mở khi bấm "Xin gợi ý" (shell đã
 * ghi event hint; server tính assisted). Ưu tiên feedbackGuide của bài;
 * fallback là khung giao tiếp hội nghị chung (port từ view cũ).
 */
export function SpeakingHint({ data }: { data: SessionData }) {
  const { activity } = data;
  return (
    <div>
      <div className="mb-1 font-bold">💡 Gợi ý cấu trúc & từ khoá:</div>
      <div className="leading-relaxed">
        {activity.feedbackGuide ||
          "Mở đầu chào hỏi chuyên nghiệp ('Hello Dr. ..., great presentation on ...'), giới thiệu vai trò của bạn ('I am a musculoskeletal radiologist from Vietnam'), nêu câu hỏi hoặc điểm tâm đắc ('I particularly appreciated your insight on ...'), và để mở cơ hội trao đổi danh thiếp hoặc email ('Could I exchange contact with you?')."}
      </div>
    </div>
  );
}
