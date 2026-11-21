"use client";

import { useEffect } from "react";
import { Button, Icon } from "@/components/ui";
import { useRecorder } from "../../hooks/use-recorder";

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  return `${mins.toString().padStart(2, "0")}:${(secs % 60)
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Khung ghi âm shadowing gọn (dùng useRecorder headless + Tailwind,
 * không dùng inline style). Dừng ghi → onComplete(blob)
 * để panel upload + chấm phát âm.
 */
export function ShadowingRecorder({
  maxSeconds = 60,
  busy,
  failed = false,
  onComplete,
}: {
  maxSeconds?: number;
  /** Đang upload/chấm — khoá nút ghi lại. */
  busy: boolean;
  failed?: boolean;
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
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-base leading-relaxed text-amber-900">
          <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-amber-700" />
          <span>
            Nếu ghi âm không chạy trong Zalo, hãy chạm menu (⋯) và chọn
            &ldquo;Mở bằng Safari&rdquo; (iPhone) hoặc &ldquo;Mở bằng
            Chrome&rdquo; (Android).
          </span>
        </div>
      )}

      {/* Lỗi quyền micro */}
      {recorder.error && (
        <div role="alert" className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800">
          <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
          <span>{recorder.error}</span>
        </div>
      )}

      {/* Trạng thái thời gian */}
      <div
        className={`mb-3 flex flex-col items-center rounded-xl px-4 py-4 text-center ${
          recorder.isRecording ? "bg-red-50 ring-2 ring-inset ring-red-300" : "bg-surface"
        }`}
      >
        <div className="flex items-baseline gap-2">
          {recorder.isRecording && (
            <span aria-hidden="true" className="h-3 w-3 animate-pulse self-center rounded-full bg-red-600" />
          )}
          <span
            className={`text-3xl font-semibold tabular-nums tracking-tight ${
              recorder.isRecording ? "text-red-700" : "text-text"
            }`}
          >
            {formatTime(recorder.durationSeconds)}
          </span>
          <span className="text-sm tabular-nums text-text-muted">/ {formatTime(maxSeconds)}</span>
        </div>
        <p className="mt-1 text-base text-text-secondary">
          {recorder.isRecording
            ? "Đang thu âm giọng nói của bạn... Nhấn Dừng khi hoàn thành."
            : recorder.blob
              ? "Đã ghi âm xong — nghe lại hoặc thu lại."
              : "Sẵn sàng thu âm. Hãy đảm bảo ở nơi yên tĩnh."}
        </p>
      </div>

      {/* Nghe lại trước khi gửi chấm */}
      {recorder.audioUrl && !recorder.isRecording && (
        <audio
          controls
          src={recorder.audioUrl}
          className="mb-3 h-11 w-full"
        />
      )}

      <div className="flex flex-wrap gap-2.5">
        {!recorder.isRecording && !recorder.blob && (
          <Button fullWidth disabled={busy} onClick={() => void recorder.start()}>
            <Icon name="mic" className="h-4 w-4" />
            Bắt đầu ghi âm
          </Button>
        )}
        {recorder.isRecording && (
          <Button variant="danger" fullWidth onClick={recorder.stop}>
            <Icon name="stop" className="h-4 w-4" />
            Dừng ghi âm ({formatTime(recorder.durationSeconds)})
          </Button>
        )}
        {recorder.blob && !recorder.isRecording && (
          <Button variant="outline" disabled={busy} onClick={recorder.clear}>
            <Icon name="trash" className="h-4 w-4" />
            Thu lại từ đầu
          </Button>
        )}
        {recorder.blob && failed && !recorder.isRecording && <Button disabled={busy} onClick={() => { if (recorder.blob) onComplete(recorder.blob); }}>Thử chấm bản ghi lại</Button>}
      </div>
    </div>
  );
}
