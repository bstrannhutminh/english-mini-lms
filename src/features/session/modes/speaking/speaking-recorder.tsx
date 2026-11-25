"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Recorder } from "../../hooks/use-recorder";
import { StepProgress } from "../../shared/step-progress";
import type { MediaUploadStatus } from "./state";
import { SpeakingUploadStatus } from "./speaking-upload-status";

const STEPS = ["Chuẩn bị ý", "Ghi âm", "Nghe lại & nộp"] as const;

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainder = secs % 60;
  return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

/**
 * Phòng thu của mode Nói — trung tâm thị giác của vùng làm bài:
 * 3 chặng (Chuẩn bị → Ghi âm → Nghe lại & nộp), đồng hồ số lớn, nút ghi âm
 * tròn 80px, nghe lại + trạng thái tải lên rõ ràng. Không dùng emoji làm icon.
 */
export function SpeakingRecorder({
  recorder,
  busy,
  mediaStatus,
  mediaError,
  onRetryUpload,
  onClearTake,
  restoredAudioUrl = null,
  restoredDurationSeconds = 0,
  restoreError = null,
  hasRestoredTake = false,
  maxSeconds = 300,
}: {
  recorder: Recorder;
  busy: boolean;
  mediaStatus: MediaUploadStatus;
  mediaError: string | null;
  onRetryUpload: () => void;
  onClearTake: () => void;
  restoredAudioUrl?: string | null;
  restoredDurationSeconds?: number;
  restoreError?: string | null;
  hasRestoredTake?: boolean;
  maxSeconds?: number;
}) {
  const { isRecording, blob, audioUrl, durationSeconds, error, isInAppBrowser } =
    recorder;

  const hasTake = Boolean(blob) || hasRestoredTake;
  const playbackUrl = audioUrl || restoredAudioUrl;
  const displayDuration = blob || isRecording ? durationSeconds : restoredDurationSeconds;
  const currentStage = isRecording ? 2 : hasTake ? 3 : 1;
  const done = hasTake && !isRecording;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="eyebrow">Bài làm</p>
          <h2 className="text-lg font-semibold text-text">Thu âm bài nói</h2>
        </div>
        <p className="text-sm text-text-muted">Tối đa {Math.floor(maxSeconds / 60)} phút</p>
      </div>

      <StepProgress steps={STEPS} current={currentStage} className="mt-4" />

      {isInAppBrowser && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base leading-relaxed text-amber-900">
          <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-amber-700" />
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
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800"
        >
          <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sân khấu ghi âm: đồng hồ lớn + nút tròn */}
      <div
        className={cn(
          "mt-4 flex flex-col items-center rounded-2xl px-4 py-6 text-center transition-colors sm:py-8",
          isRecording ? "bg-red-50" : done ? "bg-emerald-50/60" : "bg-surface-muted"
        )}
      >
        <p className="flex items-baseline gap-2" aria-live="off">
          <span
            className={cn(
              "text-6xl font-semibold leading-none tracking-tight tabular-nums",
              isRecording ? "text-red-700" : "text-text"
            )}
          >
            {formatTime(displayDuration)}
          </span>
          <span className="text-sm tabular-nums text-text-muted">/ {formatTime(maxSeconds)}</span>
        </p>

        {!isRecording && !hasTake && (
          <button
            type="button"
            onClick={() => void recorder.start()}
            disabled={busy}
            className="group mt-5 flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl px-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="pressable inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lift ring-8 ring-primary/10 group-hover:bg-primary-dark">
              <Icon name="mic" className="h-8 w-8" />
            </span>
            <span className="text-base font-semibold text-text">Bắt đầu ghi âm</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={recorder.stop}
            className="group mt-5 flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl px-4"
          >
            <span className="relative inline-flex h-20 w-20 items-center justify-center">
              <span aria-hidden="true" className="absolute -inset-2 animate-pulse rounded-full bg-red-200" />
              <span className="pressable relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-lift group-hover:bg-red-700">
                <Icon name="stop" className="h-7 w-7" />
              </span>
            </span>
            <span className="text-base font-semibold text-red-800">Dừng ghi âm</span>
          </button>
        )}

        {done && (
          <span className="mt-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" className="h-8 w-8" />
          </span>
        )}

        <p className="mt-3 max-w-sm text-base leading-relaxed text-text-secondary">
          {isRecording
            ? "Đang thu âm giọng nói của bạn… Nhấn Dừng khi nói xong."
            : hasTake
              ? "Đã thu xong. Hãy nghe lại trước khi bấm Nộp bài."
              : "Chọn nơi yên tĩnh và bấm Bắt đầu ghi âm khi sẵn sàng."}
        </p>
      </div>

      {playbackUrl && !isRecording && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-base font-semibold text-text">
            <Icon name="volume" className="h-4 w-4 text-primary" />
            <span>Nghe lại bản ghi trước khi nộp</span>
          </p>
          <audio controls src={playbackUrl} className="h-11 w-full" />
        </div>
      )}

      {restoreError && !playbackUrl && (
        <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {restoreError}
        </p>
      )}

      {done && (
        <>
          <SpeakingUploadStatus
            mediaStatus={mediaStatus}
            mediaError={mediaError}
            busy={busy}
            onRetryUpload={onRetryUpload}
          />
          <button
            type="button"
            onClick={onClearTake}
            disabled={busy}
            className="pressable mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-base font-medium text-text-secondary hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Icon name="trash" className="h-4 w-4" />
            <span>Thu lại từ đầu</span>
          </button>
        </>
      )}
    </section>
  );
}
