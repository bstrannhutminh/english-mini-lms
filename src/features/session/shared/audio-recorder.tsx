"use client";

import { formatRecordTime, useMediaRecorder } from "./use-media-recorder";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  onClear: () => void;
  maxSeconds?: number;
}

/**
 * Thẻ ghi âm: trạng thái + đồng hồ, nghe lại, nút thu/dừng/thu lại.
 * Logic MediaRecorder nằm trong use-media-recorder.ts.
 */
export function AudioRecorder({
  onRecordingComplete,
  onClear,
  maxSeconds = 300,
}: AudioRecorderProps) {
  const {
    isRecording,
    recordedBlob,
    audioUrl,
    duration,
    isInAppBrowser,
    permissionError,
    startRecording,
    stopRecording,
    handleReset,
  } = useMediaRecorder({ onRecordingComplete, onClear, maxSeconds });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Cảnh báo trình duyệt Zalo / in-app */}
      {isInAppBrowser && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] leading-snug text-amber-800">
          💡 <strong>Lưu ý:</strong> Nếu tính năng ghi âm không chạy trong Zalo,
          vui lòng chạm biểu tượng menu (⋯) và chọn{" "}
          <strong>&ldquo;Mở bằng Safari&rdquo;</strong> (iPhone) hoặc{" "}
          <strong>&ldquo;Mở bằng Chrome&rdquo;</strong> (Android).
        </div>
      )}

      {/* Lỗi quyền micro */}
      {permissionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          ⚠️ {permissionError}
        </div>
      )}

      {/* Khu vực trạng thái thời gian và chỉ báo ghi âm */}
      <div
        className={`mb-4 flex flex-col items-center justify-center rounded-xl px-4 py-6 transition-all ${
          isRecording
            ? "border-2 border-red-500 bg-red-50"
            : "border border-dashed border-slate-300 bg-slate-50"
        }`}
      >
        <div className="mb-2 flex items-center gap-2.5">
          {isRecording && (
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-red-500" />
          )}
          <span
            className={`font-mono text-3xl font-extrabold ${
              isRecording ? "text-red-600" : "text-slate-900"
            }`}
          >
            {formatRecordTime(duration)}
          </span>
          <span className="text-sm text-slate-500">/ {formatRecordTime(maxSeconds)}</span>
        </div>

        <div className="text-[13px] text-slate-500">
          {isRecording
            ? "Đang thu âm giọng nói của bạn... Nhấn Dừng khi hoàn thành."
            : recordedBlob
              ? "Đã ghi âm xong. Bạn có thể nghe lại bên dưới hoặc thu lại."
              : "Sẵn sàng thu âm (tối đa 5 phút). Hãy đảm bảo ở nơi yên tĩnh."}
        </div>
      </div>

      {/* Trình phát nghe lại âm thanh */}
      {audioUrl && !isRecording && (
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-bold uppercase text-slate-600">
            🎧 Nghe lại bài nói trước khi nộp:
          </div>
          <audio controls src={audioUrl} className="h-11 w-full rounded-lg" />
        </div>
      )}

      {/* Các nút bấm điều khiển (Touch targets >= 44px) */}
      <div className="flex flex-wrap gap-2.5">
        {!isRecording && !recordedBlob && (
          <button
            onClick={startRecording}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-red-600/20"
          >
            <span>🎙️</span> Bắt đầu ghi âm
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-bold text-white"
          >
            <span>⏹️</span> Dừng ghi âm ({formatRecordTime(duration)})
          </button>
        )}

        {recordedBlob && !isRecording && (
          <button
            onClick={handleReset}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600"
          >
            <span>🗑️</span> Thu lại từ đầu
          </button>
        )}
      </div>
    </div>
  );
}
