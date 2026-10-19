"use client";

import { Button } from "@/components/ui";
import type { CaptureHelpers, SessionTranscriptSegment } from "../types";

/**
 * Thẻ transcript khoá/mở (invariant):
 * - Chỉ hiện nội dung khi `revealed` — tức server ĐÃ trả transcriptSegments
 *   (reveal event đã ghi hoặc đã nộp bài). Client không tự suy ra.
 * - POST event reveal thất bại → hiện lỗi tiếng Việt + nút Thử lại,
 *   transcript vẫn khoá.
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
  /** Đã ghi event reveal nhưng server chưa trả segments — hiện chờ tải. */
  loadingTranscript: boolean;
  segments: SessionTranscriptSegment[];
  onReveal: () => void;
  onSeek: (seconds: number) => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const fullTranscript = segments.map((s) => s.text).join("\n");

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
      {!revealed ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <div className="text-sm font-bold text-slate-700">
              🔒 Transcript bài nói đang được khoá
            </div>
            <p className="m-0 mt-0.5 text-[13px] leading-snug text-slate-500">
              Nên cố gắng nghe tự nhiên. Mở transcript trước khi nộp bài sẽ tính
              là &ldquo;Có hỗ trợ&rdquo;.
            </p>
            {revealError && (
              <p role="alert" className="m-0 mt-1.5 text-[13px] font-semibold text-red-600">
                ⚠️ {revealError}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={onReveal}
            loading={isRevealing}
          >
            {revealError ? "Thử lại" : "👁️ Mở xem trước transcript"}
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="text-sm font-bold text-amber-700">
              💡 Transcript đoạn nghe (đã mở trước khi nộp):
            </div>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
              Ghi nhận Assisted
            </span>
          </div>

          {loadingTranscript ? (
            <p className="m-0 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-500">
              ⏳ Đang tải transcript…
            </p>
          ) : segments.length === 0 ? (
            <p className="m-0 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-500">
              Đoạn nghe này chưa có transcript.
            </p>
          ) : (
            <div
              {...capture.selectHandlers(fullTranscript, sourceRef)}
              className="flex max-h-56 flex-col gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[13px] leading-snug text-slate-700"
                >
                  <button
                    type="button"
                    onClick={() => onSeek(seg.startSeconds)}
                    className="inline-flex min-h-[28px] shrink-0 items-center rounded bg-slate-200 px-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-300"
                  >
                    ▶ {seg.startSeconds}s
                  </button>
                  <span>{seg.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
