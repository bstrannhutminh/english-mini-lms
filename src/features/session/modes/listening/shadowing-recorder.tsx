"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";
import { useRecorder } from "../../hooks/use-recorder";

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  return `${mins.toString().padStart(2, "0")}:${(secs % 60)
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Khung ghi âm shadowing gọn (dùng useRecorder headless + Tailwind).
 * Luồng 2 bước rõ ràng: Dừng ghi → NGHE LẠI → learner tự chọn
 * "Gửi chấm" (upload + chấm phát âm) hoặc "Ghi lại" — không tự gửi.
 * Shadowing chỉ mở sau khi đã nộp bài nghe nên không có áp lực hết giờ;
 * bản ghi chạm trần `maxSeconds` vẫn nằm yên ở bước nghe lại.
 */
export function ShadowingRecorder({
  maxSeconds = 60,
  busy,
  failed = false,
  onSubmit,
}: {
  maxSeconds?: number;
  /** Đang upload/chấm — khoá mọi nút hành động. */
  busy: boolean;
  /** Lần gửi trước thất bại — cho phép bấm Gửi chấm lại với cùng bản ghi. */
  failed?: boolean;
  onSubmit: (blob: Blob) => void;
}) {
  const recorder = useRecorder(maxSeconds);
  // Bản ghi đã bấm gửi gần nhất — chống gửi trùng cùng một take sau khi chấm xong
  // (state vì tham gia trực tiếp vào quyết định render nút Gửi chấm).
  const [lastSentBlob, setLastSentBlob] = useState<Blob | null>(null);

  const takeReady = Boolean(recorder.blob) && !recorder.isRecording;
  // Chưa gửi take này, hoặc gửi nhưng thất bại → được bấm Gửi chấm (lại).
  const canSend =
    takeReady &&
    !busy &&
    (recorder.blob !== lastSentBlob || failed);

  function handleSend() {
    if (!recorder.blob || !canSend) return;
    setLastSentBlob(recorder.blob);
    onSubmit(recorder.blob);
  }

  function handleRetake() {
    setLastSentBlob(null);
    recorder.clear();
  }

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

      {/* Lỗi quyền micro + nút thử lại ngay trong khung cảnh báo */}
      {recorder.error && (
        <div role="alert" className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800">
          <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 break-words">{recorder.error}</span>
          <button
            type="button"
            onClick={() => void recorder.start()}
            disabled={busy}
            className="pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-red-300 bg-surface px-3 text-base font-semibold text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Thử lại
          </button>
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
            : takeReady
              ? canSend
                ? "Đã ghi xong — hãy nghe lại, rồi chọn Gửi chấm hoặc Ghi lại."
                : "Đã gửi chấm — xem nhận xét bên dưới, hoặc Ghi lại để luyện tiếp."
              : "Sẵn sàng thu âm. Hãy đảm bảo ở nơi yên tĩnh."}
        </p>
      </div>

      {/* Nghe lại trước khi quyết định gửi chấm */}
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
        {takeReady && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={handleRetake}
            >
              <Icon name="mic" className="h-4 w-4" />
              Ghi lại
            </Button>
            {canSend && (
              <Button className="flex-1" disabled={busy} onClick={handleSend}>
                <Icon name="send" className="h-4 w-4" />
                {failed ? "Gửi chấm lại" : "Gửi chấm"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
