"use client";

import { Badge, Button, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CaptureHelpers, SessionTranscriptSegment } from "../types";

/**
 * Thẻ transcript khoá/mở (invariant):
 * - Chỉ hiện nội dung khi `revealed` — tức server ĐÃ trả transcriptSegments
 *   (reveal event đã ghi hoặc đã nộp bài). Client không tự suy ra.
 * - POST event reveal thất bại → hiện lỗi tiếng Việt + nút Thử lại, transcript vẫn khoá.
 */
export function ListeningTranscriptCard({
  revealed,
  isRevealing,
  revealError,
  loadingTranscript,
  segments,
  onReveal,
  onSeek,
  capture,
  sourceRef,
  className,
}: {
  revealed: boolean;
  isRevealing: boolean;
  revealError: string | null;
  loadingTranscript: boolean;
  segments: SessionTranscriptSegment[];
  onReveal: () => void;
  onSeek: (seconds: number) => void;
  capture: CaptureHelpers;
  sourceRef: string;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface p-4 sm:p-5", className)}>
      {!revealed ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
            <Icon name="lock" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 basis-56">
            <h3 className="text-base font-semibold text-text">Transcript đang được khoá</h3>
            <p className="mt-0.5 text-sm leading-5 text-text-secondary">
              Hãy nghe tự nhiên và trả lời trước. Mở transcript trước khi nộp
              sẽ đánh dấu bài là &ldquo;Có hỗ trợ&rdquo;.
            </p>
            {revealError && (
              <p role="alert" className="mt-2 text-base font-semibold text-red-700">
                {revealError}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={onReveal} loading={isRevealing} className="w-full sm:w-auto">
            {!isRevealing && <Icon name="eye" className="h-4 w-4" />}
            {revealError ? "Thử lại" : "Mở xem trước"}
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Icon name="unlock" className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-text">Transcript đoạn nghe (đã mở trước khi nộp)</h3>
            </div>
            <Badge tone="warning" className="shrink-0">Có hỗ trợ</Badge>
          </div>

          {loadingTranscript ? (
            <p className="mt-3 rounded-xl bg-surface-muted p-3 text-base text-text-muted">
              Đang tải transcript…
            </p>
          ) : segments.length === 0 ? (
            <p className="mt-3 rounded-xl bg-surface-muted p-3 text-base text-text-muted">
              Đoạn nghe này chưa có transcript.
            </p>
          ) : (
            <div className="mt-3 flex max-h-96 flex-col gap-3 overflow-y-auto overscroll-contain border-t border-border pt-3">
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  {...capture.selectHandlers(seg.text, `${sourceRef} · câu ${seg.startSeconds}–${seg.endSeconds}s`, "video")}
                  className="flex items-start gap-3 text-base leading-relaxed text-text"
                >
                  <button
                    type="button"
                    onClick={() => onSeek(seg.startSeconds)}
                    aria-label={`Nghe từ giây ${seg.startSeconds}`}
                    className="pressable inline-flex min-h-11 min-w-14 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-xl border border-border bg-surface px-2 text-sm font-semibold tabular-nums text-primary-dark hover:bg-primary-soft"
                  >
                    <Icon name="play" className="h-3 w-3" />
                    {seg.startSeconds}s
                  </button>
                  <span className="min-w-0 break-words pt-2">{seg.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
