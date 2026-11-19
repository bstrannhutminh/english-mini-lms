"use client";

import { Button, Icon } from "@/components/ui";
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
}) {
  const fullTranscript = segments.map((s) => s.text).join("\n");

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
      {!revealed ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm font-bold text-text">
              <Icon name="lock" className="h-4 w-4 text-slate-500" />
              <span>Transcript đang được khoá</span>
            </div>
            <p className="m-0 mt-1 text-xs leading-relaxed text-text-secondary">
              Hãy nghe tự nhiên và trả lời trước. Mở transcript trước khi nộp
              sẽ đánh dấu bài là &ldquo;Có hỗ trợ&rdquo;.
            </p>
            {revealError && (
              <p
                role="alert"
                className="m-0 mt-1.5 text-xs font-semibold text-red-600"
              >
                {revealError}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={onReveal} loading={isRevealing}>
            {!isRevealing && <Icon name="eye" className="h-4 w-4" />}
            {revealError ? "Thử lại" : "Mở xem trước"}
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-800">
              <Icon name="unlock" className="h-4 w-4 text-amber-600" />
              <span>Transcript đoạn nghe (đã mở trước khi nộp)</span>
            </div>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
              Có hỗ trợ
            </span>
          </div>

          {loadingTranscript ? (
            <p className="m-0 rounded-xl border border-border-subtle bg-surface-muted p-3 text-xs text-text-muted">
              Đang tải transcript…
            </p>
          ) : segments.length === 0 ? (
            <p className="m-0 rounded-xl border border-border-subtle bg-surface-muted p-3 text-xs text-text-muted">
              Đoạn nghe này chưa có transcript.
            </p>
          ) : (
            <div
              {...capture.selectHandlers(fullTranscript, sourceRef)}
              className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-xl border border-border-subtle bg-surface-muted p-3"
            >
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-text"
                >
                  <button
                    type="button"
                    onClick={() => onSeek(seg.startSeconds)}
                    className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-2 text-xs font-semibold tabular-nums text-primary-dark transition hover:bg-teal-50"
                  >
                    <Icon name="play" className="h-3 w-3" />
                    {seg.startSeconds}s
                  </button>
                  <span className="pt-1">{seg.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
