"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { useRecorder } from "../../hooks/use-recorder";

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  return `${mins.toString().padStart(2, "0")}:${(secs % 60)
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Khung ghi âm shadowing gọn (dùng useRecorder headless + Tailwind,
 * thay audio-recorder.tsx cũ có inline style). Dừng ghi → onComplete(blob)
 * để panel upload + chấm phát âm.
 */
export function ShadowingRecorder({
  maxSeconds = 60,
  busy,
  onComplete,
}: {
  maxSeconds?: number;
  /** Đang upload/chấm — khoá nút ghi lại. */
  busy: boolean;
  onComplete: (blob: Blob) => void;
}) {
  const recorder = useRecorder(maxSeconds);

  // Có blob mới → bàn giao cho luồng chấm (mỗi blob chỉ bắn 1 lần).
  const blob = recorder.blob;
  useEffect(() => {
    if (blob) onComplete(blob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  return (
    <div>
      {/* Cảnh báo trình duyệt in-app (Zalo/FB) */}
      {recorder.isInAppBrowser && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-800">
          💡 Nếu ghi âm không chạy trong Zalo, hãy chạm menu (⋯) và chọn
          &ldquo;Mở bằng Safari&rdquo; (iPhone) hoặc &ldquo;Mở bằng
          Chrome&rdquo; (Android).
        </div>
      )}

      {/* Lỗi quyền micro */}
      {recorder.error && (
        <div role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⚠️ {recorder.error}
        </div>
      )}

      {/* Trạng thái thời gian */}
      <div
        className={`mb-3 flex flex-col items-center rounded-xl px-4 py-4 ${
          recorder.isRecording
            ? "border-2 border-red-500 bg-red-50"
            : "border border-dashed border-slate-300 bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2">
          {recorder.isRecording && (
            <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-red-500" />
          )}
          <span
            className={`font-mono text-2xl font-extrabold ${
              recorder.isRecording ? "text-red-600" : "text-slate-900"
            }`}
          >
            {formatTime(recorder.durationSeconds)}
          </span>
          <span className="text-sm text-slate-500">/ {formatTime(maxSeconds)}</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {recorder.isRecording
            ? "Đang thu âm giọng nói của bạn... Nhấn Dừng khi hoàn thành."
            : recorder.blob
              ? "Đã ghi âm xong — nghe lại hoặc thu lại."
              : "Sẵn sàng thu âm. Hãy đảm bảo ở nơi yên tĩnh."}
        </div>
      </div>

      {/* Nghe lại trước khi gửi chấm */}
      {recorder.audioUrl && !recorder.isRecording && (
        <audio
          controls
          src={recorder.audioUrl}
          className="mb-3 h-11 w-full rounded-lg"
        />
      )}

      <div className="flex flex-wrap gap-2.5">
        {!recorder.isRecording && !recorder.blob && (
          <Button variant="danger" fullWidth onClick={() => void recorder.start()}>
            🎙️ Bắt đầu ghi âm
          </Button>
        )}
        {recorder.isRecording && (
          <Button variant="secondary" fullWidth onClick={recorder.stop}>
            ⏹️ Dừng ghi âm ({formatTime(recorder.durationSeconds)})
          </Button>
        )}
        {recorder.blob && !recorder.isRecording && (
          <Button variant="outline" disabled={busy} onClick={recorder.clear}>
            🗑️ Thu lại từ đầu
          </Button>
        )}
      </div>
    </div>
  );
}
