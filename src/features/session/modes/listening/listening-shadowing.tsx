"use client";

import { useState } from "react";
import { Button, Icon, Spinner } from "@/components/ui";
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
      <div className="rounded-2xl border border-border bg-surface p-4 text-base leading-relaxed text-text-secondary sm:p-5">
        Đoạn nghe này chưa có transcript nên chưa luyện Shadowing được. Bạn vẫn
        có thể nghe lại video và tự nhại theo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
        <p className="eyebrow">Chặng 3</p>
        <h2 className="text-lg font-semibold text-text">Luyện Shadowing từng câu</h2>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          Bấm <strong>Nghe mẫu</strong> để nghe diễn giả phát âm, sau đó bấm{" "}
          <strong>Thu âm luyện câu này</strong> để nhại lại (Shadowing). AI sẽ
          góp ý dựa trên bản ghi âm và câu mẫu. Kiểm tra phần giới hạn đánh giá của từng kết quả.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800"
        >
          <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {segments.map((seg, idx) => {
        const isOpen = openIndex === idx;
        const isEvaluating = evaluatingIndex === idx;
        const result = results[idx];

        return (
          <article
            key={idx}
            className={`rounded-2xl border bg-surface p-4 sm:p-5 ${
              isOpen ? "border-primary" : "border-border"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="eyebrow tabular-nums">
                Câu {idx + 1} · {seg.startSeconds}s–{seg.endSeconds}s
              </p>
              <button
                type="button"
                onClick={() => onSeek(seg.startSeconds)}
                className="pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 text-base font-medium text-primary-dark hover:bg-primary-soft"
              >
                <Icon name="play" className="h-3.5 w-3.5" />
                Nghe mẫu
              </button>
            </div>

            <p
              {...capture.selectHandlers(seg.text, `${sourceRef} · câu ${seg.startSeconds}–${seg.endSeconds}s`, "video")}
              className="mb-4 max-w-[65ch] text-base font-medium leading-relaxed text-text"
            >
              &ldquo;{seg.text}&rdquo;
            </p>

            {isOpen ? (
              <div className="rounded-xl bg-surface-muted p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-base font-semibold text-text">
                    <Icon name="mic" className="h-4 w-4 text-skill-speaking" />
                    Ghi âm Shadowing câu {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(null)}
                    disabled={evaluatingIndex !== null}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-base text-text-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Đóng
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>

                <ShadowingRecorder
                  maxSeconds={60}
                  busy={evaluatingIndex !== null}
                  failed={failedIndex === idx}
                  onComplete={(blob) => void handleComplete(idx, blob)}
                />

                {isEvaluating && (
                  <div role="status" className="mt-3 flex items-center justify-center gap-2.5 text-base font-medium text-primary-dark">
                    <Spinner size="sm" label="Đang chấm" />
                    AI đang lắng nghe và đánh giá phát âm của bạn...
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" disabled={evaluatingIndex !== null} onClick={() => setOpenIndex(idx)}>
                <Icon name="mic" className="h-4 w-4" />
                Thu âm luyện câu này
              </Button>
            )}

            {result && <ShadowingFeedback result={result} />}
          </article>
        );
      })}
    </div>
  );
}
