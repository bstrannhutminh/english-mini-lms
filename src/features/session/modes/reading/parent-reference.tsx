"use client";

import type { WritingFeedback } from "@/server/providers/gemini/types";
import type { CaptureHelpers, SessionParentData } from "../types";
import { parseReadingPayload } from "./state";

/**
 * Khung đối chiếu Bản 1 + các điểm cần sửa (luồng revision qua parentId).
 * Body bản cha là payload JSON {mainIdea, translation, keyTerms} — parse để
 * hiển thị bản dịch cũ; bôi đen mở được Smart Capture.
 */
export function ReadingParentReference({
  parentData,
  open,
  onToggle,
  capture,
  sourceRef,
}: {
  parentData: SessionParentData;
  open: boolean;
  onToggle: () => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const feedback = parentData.feedback as WritingFeedback | null;
  const parent = parseReadingPayload(parentData.submission.body);
  const parentText =
    parent.translation ||
    parent.mainIdea ||
    parentData.submission.body ||
    "";

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-orange-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[48px] w-full items-center justify-between bg-orange-50 px-4 py-3 text-left text-sm font-semibold text-orange-700"
      >
        <span>
          📖 Đối chiếu Bản {parentData.submission.revision} và các lỗi cần sửa (
          {open ? "Thu gọn" : "Mở rộng"})
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-3.5 text-sm">
          <div
            {...capture.selectHandlers(parentText, sourceRef)}
            className="mb-3 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed text-slate-700"
          >
            {parentText}
          </div>

          {feedback?.observations && feedback.observations.length > 0 && (
            <div>
              <div className="mb-1.5 font-semibold text-orange-800">
                Các điểm cần tập trung sửa từ bản trước:
              </div>
              <div className="flex flex-col gap-1.5">
                {feedback.observations.map((obs, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[13px]"
                  >
                    <span className="font-semibold text-amber-700">
                      {obs.location}:
                    </span>{" "}
                    <span className="text-amber-900">{obs.issue}</span> →{" "}
                    <span className="font-medium text-emerald-700">
                      {obs.suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
