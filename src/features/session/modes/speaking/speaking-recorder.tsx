"use client";

import type { Recorder } from "../../hooks/use-recorder";
import type { MediaUploadStatus } from "./state";

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainder = secs % 60;
  return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

/**
 * UI ghi âm của mode Nói — headless qua useRecorder (port từ audio-recorder
 * inline-style cũ sang Tailwind). Nghe lại / thu lại trước khi nộp; hiển thị
 * trạng thái upload audio (mediaId) với đường thử lại khi lỗi.
 */
export function SpeakingRecorder({
  recorder,
  busy,
  mediaStatus,
  mediaError,
  onRetryUpload,
  onClearTake,
  maxSeconds = 300,
}: {
  recorder: Recorder;
  /** Đang nộp bài — khoá mọi nút. */
  busy: boolean;
  mediaStatus: MediaUploadStatus;
  mediaError: string | null;
  /** Tải lại file ghi âm hiện có khi upload lỗi. */
  onRetryUpload: () => void;
  /** Xoá bản ghi hiện tại để thu lại từ đầu. */
  onClearTake: () => void;
  maxSeconds?: number;
}) {
  const { isRecording, blob, audioUrl, durationSeconds, error, isInAppBrowser } =
    recorder;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3.5 text-[15px] font-bold text-slate-800">
        🎙️ Thu âm bài nói (tối đa 5 phút):
      </div>

      {/* Cảnh báo trình duyệt in-app (Zalo/FB/Line) */}
      {isInAppBrowser && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] leading-snug text-amber-800">
          💡 <strong>Lưu ý:</strong> nếu ghi âm không chạy trong Zalo, chạm menu
          (⋯) và chọn <strong>&ldquo;Mở bằng Safari&rdquo;</strong> (iPhone) hoặc{" "}
          <strong>&ldquo;Mở bằng Chrome&rdquo;</strong> (Android).
        </div>
      )}

      {/* Lỗi quyền micro */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
        >
          ⚠️ {error}
        </div>
      )}

      {/* Đồng hồ + trạng thái thu */}
      <div
        className={`mb-4 flex flex-col items-center justify-center rounded-2xl px-4 py-6 transition-colors ${
          isRecording
            ? "border-2 border-red-500 bg-red-50"
            : "border border-dashed border-slate-300 bg-slate-50"
        }`}
      >
        <div className="mb-2 flex items-center gap-2.5">
          {isRecording && (
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-pulse rounded-full bg-red-500"
            />
          )}
          <span
            className={`font-mono text-3xl font-extrabold ${
              isRecording ? "text-red-600" : "text-slate-900"
            }`}
          >
            {formatTime(durationSeconds)}
          </span>
          <span className="text-sm text-slate-500">/ {formatTime(maxSeconds)}</span>
        </div>
        <div className="text-center text-[13px] text-slate-500">
          {isRecording
            ? "Đang thu âm giọng nói của bạn... Nhấn Dừng khi hoàn thành."
            : blob
              ? "Đã ghi âm xong. Nghe lại bên dưới hoặc thu lại trước khi nộp."
              : "Sẵn sàng thu âm (tối đa 5 phút). Hãy đảm bảo ở nơi yên tĩnh."}
        </div>
      </div>

      {/* Nghe lại bản ghi trước khi nộp */}
      {audioUrl && !isRecording && (
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-bold uppercase text-slate-600">
            🎧 Nghe lại bài nói trước khi nộp:
          </div>
          <audio controls src={audioUrl} className="h-11 w-full rounded-lg" />
        </div>
      )}

      {/* Trạng thái tải file lên (mediaId) */}
      {blob && !isRecording && mediaStatus === "uploading" && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[13px] text-blue-800">
          ⏳ Đang tải file ghi âm lên hệ thống lưu trữ...
        </div>
      )}
      {blob && !isRecording && mediaStatus === "ready" && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-800">
          ✓ File ghi âm đã sẵn sàng để nộp.
        </div>
      )}
      {blob && !isRecording && mediaStatus === "error" && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          <span>⚠️ {mediaError || "Không tải được file ghi âm lên."}</span>
          <button
            type="button"
            onClick={onRetryUpload}
            disabled={busy}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Nút điều khiển (touch ≥ 44px) */}
      <div className="flex flex-wrap gap-2.5">
        {!isRecording && !blob && (
          <button
            type="button"
            onClick={() => void recorder.start()}
            disabled={busy}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-base font-bold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden>🎙️</span> Bắt đầu ghi âm
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={recorder.stop}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-base font-bold text-white transition hover:bg-slate-800"
          >
            <span aria-hidden>⏹️</span> Dừng ghi âm ({formatTime(durationSeconds)})
          </button>
        )}

        {blob && !isRecording && (
          <button
            type="button"
            onClick={onClearTake}
            disabled={busy}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden>🗑️</span> Thu lại từ đầu
          </button>
        )}
      </div>
    </div>
  );
}
