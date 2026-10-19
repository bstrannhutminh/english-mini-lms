"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { SpeakingFeedback } from "@/contracts/submission";
import type { CaptureHelpers, SessionTranscriptSegment } from "../types";
import {
  evaluateShadowingSegment,
  uploadShadowingAudio,
} from "./shadowing-api";
import { ShadowingRecorder } from "./shadowing-recorder";

/**
 * Chế độ con Shadowing của mode nghe (đặc tả §3.4):
 * mở sau khi nộp, một câu transcript = một thẻ ghi âm ≤60s → upload media
 * (media_id như speaking) → POST /shadowing chấm phát âm theo câu mẫu.
 * Chỉ render khi `segments` có dữ liệu (server đã mở transcript).
 */
export function ListeningShadowing({
  sessionId,
  segments,
  results,
  onResult,
  onSeek,
  capture,
  sourceRef,
}: {
  sessionId: string;
  segments: SessionTranscriptSegment[];
  results: Record<number, SpeakingFeedback>;
  onResult: (index: number, feedback: SpeakingFeedback) => void;
  onSeek: (seconds: number) => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [evaluatingIndex, setEvaluatingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(index: number, blob: Blob) {
    const segment = segments[index];
    if (!segment) return;
    try {
      setEvaluatingIndex(index);
      setError(null);
      const mediaId = await uploadShadowingAudio(sessionId, blob, index);
      const feedback = await evaluateShadowingSegment(sessionId, {
        mediaId,
        sentence: segment.text,
        startSeconds: segment.startSeconds,
        endSeconds: segment.endSeconds,
      });
      onResult(index, feedback);
    } catch (err) {
      console.error("Lỗi khi chấm shadowing:", err);
      setError(
        err instanceof Error ? err.message : "Chấm shadowing thất bại.",
      );
    } finally {
      setEvaluatingIndex(null);
    }
  }

  if (segments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Đoạn nghe này chưa có transcript nên chưa luyện Shadowing được. Bạn vẫn
        có thể nghe lại video và tự nhại theo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-1 text-base font-extrabold text-slate-900">
          🎙️ Luyện Shadowing bám sát hội nghị
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-600">
          Bấm <strong>▶ Nghe mẫu</strong> để nghe diễn giả phát âm, sau đó bấm{" "}
          <strong>Thu âm luyện câu này</strong> để nhại lại (Shadowing). AI sẽ so
          sánh phát âm của bạn với chính xác câu nói của diễn giả.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600"
        >
          ⚠️ {error}
        </div>
      )}

      {segments.map((seg, idx) => {
        const isOpen = openIndex === idx;
        const isEvaluating = evaluatingIndex === idx;
        const result = results[idx];

        return (
          <div
            key={idx}
            className={`rounded-2xl border bg-white p-4 ${
              isOpen ? "border-2 border-blue-600" : "border-slate-200"
            }`}
          >
            <div className="mb-2.5 flex items-start justify-between gap-2.5">
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-700">
                Câu {idx + 1} ({seg.startSeconds}s - {seg.endSeconds}s)
              </span>
              <button
                type="button"
                onClick={() => onSeek(seg.startSeconds)}
                className="inline-flex min-h-[32px] items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 text-xs font-bold text-blue-800 hover:bg-blue-100"
              >
                ▶ Nghe mẫu
              </button>
            </div>

            <div
              {...capture.selectHandlers(seg.text, sourceRef)}
              className="mb-3 text-[15px] font-semibold leading-relaxed text-slate-900"
            >
              &ldquo;{seg.text}&rdquo;
            </div>

            {isOpen ? (
              <div className="mt-2.5 rounded-lg border border-slate-300 bg-slate-50 p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-700">
                    🎙️ Ghi âm Shadowing câu {idx + 1}:
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(null)}
                    className="inline-flex min-h-[32px] items-center text-xs text-slate-500 hover:text-slate-800"
                  >
                    Đóng ✕
                  </button>
                </div>

                <ShadowingRecorder
                  maxSeconds={60}
                  busy={isEvaluating}
                  onComplete={(blob) => void handleComplete(idx, blob)}
                />

                {isEvaluating && (
                  <div className="mt-2 text-center text-sm font-semibold text-blue-600">
                    ⏳ AI đang lắng nghe và đánh giá phát âm của bạn...
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setOpenIndex(idx)}>
                🎙️ Thu âm luyện câu này
              </Button>
            )}

            {/* Nhận xét phát âm của câu này */}
            {result && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] leading-snug text-emerald-900">
                <div className="mb-1 font-bold">
                  🗣️ Nhận xét phát âm ({result.pronunciation?.status}):
                </div>
                <div className="mb-1.5">{result.pronunciation?.notes}</div>

                {result.transcript && (
                  <div className="text-xs text-emerald-700">
                    AI nghe được: <em>&ldquo;{result.transcript}&rdquo;</em>
                    {typeof result.transcript_confidence === "number"
                      ? ` (Độ tin cậy: ${Math.round(
                          result.transcript_confidence * 100,
                        )}%)`
                      : ""}
                  </div>
                )}

                {result.observations && result.observations.length > 0 && (
                  <div className="mt-1.5 text-amber-700">
                    <strong>Điểm cần lưu ý:</strong>
                    <ul className="m-0 mt-0.5 list-disc pl-4">
                      {result.observations.map((obs, oIdx) => (
                        <li key={oIdx}>{obs.suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
