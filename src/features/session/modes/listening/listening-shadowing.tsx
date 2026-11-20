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
import { ShadowingFeedback } from "./shadowing-feedback";

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
  const [failedIndex, setFailedIndex] = useState<number | null>(null);

  async function handleComplete(index: number, blob: Blob) {
    const segment = segments[index];
    if (!segment || evaluatingIndex !== null) return;
    try {
      setEvaluatingIndex(index);
      setError(null);
      setFailedIndex(null);
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
      setFailedIndex(index);
    } finally {
      setEvaluatingIndex(null);
    }
  }

  if (segments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-600">
        Đoạn nghe này chưa có transcript nên chưa luyện Shadowing được. Bạn vẫn
        có thể nghe lại video và tự nhại theo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-1 text-base font-extrabold text-slate-900">
          Luyện Shadowing từng câu
        </div>
        <p className="m-0 text-base leading-relaxed text-slate-600">
          Bấm <strong>▶ Nghe mẫu</strong> để nghe diễn giả phát âm, sau đó bấm{" "}
          <strong>Thu âm luyện câu này</strong> để nhại lại (Shadowing). AI sẽ so
          góp ý dựa trên bản ghi âm và câu mẫu. Kiểm tra phần giới hạn đánh giá của từng kết quả.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-base text-red-600"
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
            className={`rounded-xl border bg-white p-4 ${
              isOpen ? "border-primary" : "border-border"
            }`}
          >
            <div className="mb-2.5 flex items-start justify-between gap-2.5">
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-base font-bold text-slate-700">
                Câu {idx + 1} ({seg.startSeconds}s - {seg.endSeconds}s)
              </span>
              <button
                type="button"
                onClick={() => onSeek(seg.startSeconds)}
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 text-base font-medium text-primary-dark hover:bg-primary-soft"
              >
                ▶ Nghe mẫu
              </button>
            </div>

            <div
              {...capture.selectHandlers(seg.text, `${sourceRef} · câu ${seg.startSeconds}–${seg.endSeconds}s`, "video")}
              className="mb-3 text-base font-semibold leading-relaxed text-slate-900"
            >
              &ldquo;{seg.text}&rdquo;
            </div>

            {isOpen ? (
              <div className="mt-2.5 rounded-lg border border-slate-300 bg-slate-50 p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-700">
                    🎙️ Ghi âm Shadowing câu {idx + 1}:
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(null)}
                    disabled={evaluatingIndex !== null}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-base text-text-secondary hover:text-text disabled:opacity-60"
                  >
                    Đóng ✕
                  </button>
                </div>

                <ShadowingRecorder
                  maxSeconds={60}
                  busy={evaluatingIndex !== null}
                  failed={failedIndex === idx}
                  onComplete={(blob) => void handleComplete(idx, blob)}
                />

                {isEvaluating && (
                  <div className="mt-2 text-center text-base font-semibold text-blue-600">
                    ⏳ AI đang lắng nghe và đánh giá phát âm của bạn...
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" disabled={evaluatingIndex !== null} onClick={() => setOpenIndex(idx)}>
                🎙️ Thu âm luyện câu này
              </Button>
            )}

            {result && <ShadowingFeedback result={result} />}
          </div>
        );
      })}
    </div>
  );
}
