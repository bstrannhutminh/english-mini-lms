"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Recorder } from "../../hooks/use-recorder";
import type { MediaUploadStatus } from "./state";
import { SpeakingUploadStatus } from "./speaking-upload-status";

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainder = secs % 60;
  return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

/**
 * Phòng thu gọn gàng cho mode Nói:
 * 3 bước trực quan (Chuẩn bị → Ghi âm → Nghe lại & Nộp), nút chạm ≥ 44px,
 * không dùng emoji làm icon chức năng, trạng thái upload rõ ràng.
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
  busy: boolean;
  mediaStatus: MediaUploadStatus;
  mediaError: string | null;
  onRetryUpload: () => void;
  onClearTake: () => void;
  maxSeconds?: number;
}) {
  const { isRecording, blob, audioUrl, durationSeconds, error, isInAppBrowser } =
    recorder;

  const currentStage = isRecording ? 2 : blob ? 3 : 1;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 ">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-base font-bold text-text">
          <Icon name="mic" className="h-4.5 w-4.5 text-skill-speaking" />
          <span>Thu âm bài nói</span>
        </div>
        <span className="text-base font-medium text-text-muted">
          Tối đa {Math.floor(maxSeconds / 60)} phút
        </span>
      </div>

      {/* Thanh 3 bước nói */}
      <ol className="mb-4 grid grid-cols-3 gap-1.5 text-center text-base">
        {[
          { num: 1, label: "Chuẩn bị ý" },
          { num: 2, label: "Ghi âm" },
          { num: 3, label: "Nghe lại & Nộp" },
        ].map((st) => (
          <li
            key={st.num}
            className={cn(
              "rounded-lg border px-2 py-1.5 font-semibold",
              currentStage === st.num
                ? "border-primary bg-teal-50 text-primary-dark"
                : currentStage > st.num
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-700"
                  : "border-border-subtle bg-surface-muted text-text-muted"
            )}
          >
            {st.num}. {st.label}
          </li>
        ))}
      </ol>

      {isInAppBrowser && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-base leading-relaxed text-amber-900">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <span>
            Nếu ghi âm không chạy trong trình duyệt Zalo, chạm menu (⋯) và chọn{" "}
            <strong>&ldquo;Mở bằng Safari&rdquo;</strong> hoặc{" "}
            <strong>&ldquo;Mở bằng Chrome&rdquo;</strong>.
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-base text-red-700"
        >
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Khung đồng hồ thu âm */}
      <div
        className={cn(
          "mb-4 flex flex-col items-center justify-center rounded-xl px-4 py-6 transition-colors",
          isRecording
            ? "border-2 border-red-400 bg-red-50/70"
            : blob
              ? "border border-emerald-200 bg-emerald-50/40"
              : "border border-dashed border-border bg-surface-muted"
        )}
      >
        <div className="mb-2 flex items-center gap-2.5">
          {isRecording && (
            <span
              aria-hidden
              className="h-3 w-3 animate-pulse rounded-full bg-red-600"
            />
          )}
          <span
            className={cn(
              "font-mono text-3xl font-extrabold tabular-nums",
              isRecording ? "text-red-600" : "text-text"
            )}
          >
            {formatTime(durationSeconds)}
          </span>
          <span className="text-base tabular-nums text-text-muted">
            / {formatTime(maxSeconds)}
          </span>
        </div>
        <p className="text-center text-base text-text-secondary">
          {isRecording
            ? "Đang thu âm giọng nói của bạn… Nhấn Dừng khi nói xong."
            : blob
              ? "Đã thu xong. Hãy nghe lại trước khi bấm Nộp bài."
              : "Chọn nơi yên tĩnh và bấm Bắt đầu ghi âm khi sẵn sàng."}
        </p>
      </div>

      {audioUrl && !isRecording && (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-base font-semibold text-text-secondary">
            <Icon name="volume" className="h-3.5 w-3.5 text-primary" />
            <span>Nghe lại bản ghi trước khi nộp</span>
          </div>
          <audio controls src={audioUrl} className="h-11 w-full rounded-lg" />
        </div>
      )}

      {blob && !isRecording && (
        <SpeakingUploadStatus
          mediaStatus={mediaStatus}
          mediaError={mediaError}
          busy={busy}
          onRetryUpload={onRetryUpload}
        />
      )}

      <div className="flex flex-wrap gap-2.5">
        {!isRecording && !blob && (
          <button
            type="button"
            onClick={() => void recorder.start()}
            disabled={busy}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white  transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="mic" className="h-5 w-5" />
            <span>Bắt đầu ghi âm</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={recorder.stop}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-base font-semibold text-white  transition hover:bg-red-700"
          >
            <Icon name="stop" className="h-4.5 w-4.5" />
            <span>Dừng ghi âm ({formatTime(durationSeconds)})</span>
          </button>
        )}

        {blob && !isRecording && (
          <button
            type="button"
            onClick={onClearTake}
            disabled={busy}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-muted px-4 text-base font-semibold text-text-secondary transition hover:bg-slate-200/70 hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="trash" className="h-4 w-4" />
            <span>Thu lại từ đầu</span>
          </button>
        )}
      </div>
    </div>
  );
}
