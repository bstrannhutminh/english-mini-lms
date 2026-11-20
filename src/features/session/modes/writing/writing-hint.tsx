"use client";

import { MarkdownText } from "@/components/ui";
import type { SessionData } from "../types";

/** Support comes from the approved activity, so summaries never inherit an email template. */
export function WritingHint({ data }: { data: SessionData }) {
  const { activity } = data;
  return (
    <div className="space-y-3">
      <p className="font-semibold">Tập trung vào yêu cầu của bài này</p>
      {activity.objective && <p>{activity.objective}</p>}
      {activity.feedbackGuide ? (
        <MarkdownText text={activity.feedbackGuide} />
      ) : (
        <p>Đối chiếu từng yêu cầu trong đề với bản viết của bạn trước khi nộp.</p>
      )}
    </div>
  );
}
