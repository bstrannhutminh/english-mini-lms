"use client";

import type { SessionParentData } from "../types";

/**
 * Shape thật của feedback mà getSubmissionWithFeedback ghép lại
 * (assessment.service.ts): observations/strengths/next_action/limitations/
 * scores + pronunciation từ rubricSnapshot. Thu hẹp tối thiểu cho phần
 * đối chiếu — không import kiểu server vào client runtime.
 */
interface SpeakingParentFeedback {
  observations?: Array<{ suggestion: string }> | null;
  pronunciation?: { status?: string; notes: string } | null;
}

/**
 * Khung so sánh Bản nói trước (luồng revision): audio cũ (signed URL ngắn
 * hạn), ghi chú/transcript bản trước, nhận xét phát âm và các điểm cần
 * cải thiện — port từ speaking-session-view cũ.
 */
export function SpeakingParentReference({
  parentData,
  open,
  onToggle,
}: {
  parentData: SessionParentData;
  open: boolean;
  onToggle: () => void;
}) {
  const feedback = parentData.feedback as SpeakingParentFeedback | null;

  return (
    <div className="mb-4 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[44px] w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold text-slate-700">
          📋 So sánh với Bản {parentData.submission.revision} trước đó
        </span>
        <span className="text-[13px] font-semibold text-blue-600">
          {open ? "Thu gọn ▲" : "Xem chi tiết ▼"}
        </span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2.5">
          {parentData.submission.audioUrl && (
            <div>
              <div className="mb-1 text-[13px] text-slate-500">
                🔊 Bản ghi âm trước đó (liên kết hết hạn sau 10 phút):
              </div>
              <audio
                controls
                src={parentData.submission.audioUrl}
                className="h-9 w-full"
              />
            </div>
          )}

          {parentData.submission.body && (
            <div>
              <div className="mb-0.5 text-[13px] text-slate-500">
                📝 Nội dung bản trước:
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {parentData.submission.body}
              </div>
            </div>
          )}

          {feedback?.pronunciation?.notes && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
              <strong>🗣️ Nhận xét phát âm trước đó:</strong>{" "}
              {feedback.pronunciation.notes}
            </div>
          )}

          {feedback?.observations && feedback.observations.length > 0 && (
            <div>
              <div className="mb-1 text-[13px] text-slate-500">
                🔍 Các điểm cần cải thiện lần này:
              </div>
              <ul className="m-0 list-disc pl-5 text-[13px] text-amber-700">
                {feedback.observations.map((obs, i) => (
                  <li key={i} className="mb-0.5">
                    {obs.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
