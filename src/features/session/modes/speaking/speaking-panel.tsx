"use client";

import { useCallback, useEffect, useRef } from "react";
import { Icon, MarkdownText } from "@/components/ui";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { useRecorder } from "../../hooks/use-recorder";
import { SessionColumns } from "../../shell/session-columns";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { uploadMediaResponseSchema } from "@/contracts/media";
import { SpeakingRecorder } from "./speaking-recorder";
import { SpeakingParentReference } from "./parent-reference";
import type { SpeakingModeState } from "./state";

/**
 * Vùng làm bài mode Nói: cột trái = đối chiếu bản trước + tình huống nói,
 * cột phải = phòng thu audio (upload → mediaId) + khung ghi chú ý chính
 * (cũng hỗ trợ nộp text-only với invariant pronunciation: not_assessable).
 */
export function SpeakingPanel(props: ModePanelProps) {
  const { data, busy, capture } = props;
  const { state, setState } = usePluginState<SpeakingModeState>(props);
  const { activity, parentData, sessionId } = data;
  const recorder = useRecorder(300);

  const uploadSeqRef = useRef(0);

  const uploadAudio = useCallback(
    async (blob: Blob, durationSecs: number) => {
      const seq = ++uploadSeqRef.current;
      setState((prev) => ({ ...prev, mediaStatus: "uploading", mediaError: null }));
      try {
        const fileExt = blob.type.includes("mp4") ? "mp4" : "webm";
        const file = new File(
          [blob],
          `speaking-${sessionId}-${Date.now()}.${fileExt}`,
          { type: blob.type }
        );
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId);
        if (durationSecs > 0) {
          formData.append("durationSeconds", String(Math.round(durationSecs)));
        }
        const res = await apiFetch(
          "/api/v1/media",
          { method: "POST", body: formData },
          uploadMediaResponseSchema
        );
        if (seq !== uploadSeqRef.current) return;
        setState((prev) => ({
          ...prev,
          mediaStatus: "ready",
          mediaId: res.media_id,
          mediaError: null,
        }));
      } catch (err) {
        if (seq !== uploadSeqRef.current) return;
        console.error("Lỗi tải file ghi âm:", err);
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Không thể tải file âm thanh lên hệ thống. Vui lòng thử lại.";
        setState((prev) => ({ ...prev, mediaStatus: "error", mediaError: message }));
      }
    },
    [sessionId, setState]
  );

  useEffect(() => {
    if (recorder.blob && state.mediaStatus === "idle") {
      void uploadAudio(recorder.blob, recorder.durationSeconds);
    }
  }, [recorder.blob, recorder.durationSeconds, state.mediaStatus, uploadAudio]);

  useEffect(() => {
    setState((prev) =>
      prev.isRecording === recorder.isRecording
        ? prev
        : { ...prev, isRecording: recorder.isRecording }
    );
  }, [recorder.isRecording, setState]);

  const handleRetryUpload = useCallback(() => {
    if (recorder.blob) {
      void uploadAudio(recorder.blob, recorder.durationSeconds);
    }
  }, [recorder.blob, recorder.durationSeconds, uploadAudio]);

  const handleClearTake = useCallback(() => {
    uploadSeqRef.current += 1;
    recorder.clear();
    setState((prev) => ({
      ...prev,
      mediaStatus: "idle",
      mediaId: null,
      mediaError: null,
      durationSeconds: 0,
    }));
  }, [recorder, setState]);

  const promptText = activity.promptText || activity.title;
  const sourceRef = `Bài nói: ${activity.slot || activity.id}`;

  const left = (
    <>
      {parentData && (
        <SpeakingParentReference
          parentData={parentData}
          open={state.showParentRef}
          onToggle={() =>
            setState((prev) => ({ ...prev, showParentRef: !prev.showParentRef }))
          }
        />
      )}

      <div className="mb-4 rounded-xl border border-border bg-surface p-5 ">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-skill-speaking-border bg-skill-speaking-soft px-2 py-0.5 text-base font-bold text-skill-speaking">
            <Icon name="mic" className="h-3.5 w-3.5" />
            Tình huống nói
          </span>
        </div>

        <h2 className="mb-2 text-lg font-bold text-text">{activity.title}</h2>

        {activity.objective && (
          <p className="mb-3 text-base leading-relaxed text-text-secondary">
            <strong className="text-text">Mục tiêu:</strong>{" "}
            {activity.objective}
          </p>
        )}

        <div
          {...capture.selectHandlers(promptText, sourceRef, "text")}
          className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3.5 text-base leading-relaxed text-text-secondary"
        >
          <MarkdownText text={promptText} />
        </div>
      </div>
    </>
  );

  const right = (
    <>
      <SpeakingRecorder
        recorder={recorder}
        busy={busy}
        mediaStatus={state.mediaStatus}
        mediaError={state.mediaError}
        onRetryUpload={handleRetryUpload}
        onClearTake={handleClearTake}
      />

      <div className="mt-4 rounded-xl border border-border bg-surface p-5 ">
        <label
          htmlFor="speaking-notes"
          className="mb-2 flex items-center gap-1.5 text-base font-semibold text-text"
        >
          <Icon name="pen" className="h-4 w-4 text-text-muted" />
          <span>Ghi chú dàn ý nói (tuỳ chọn)</span>
        </label>
        <textarea
          id="speaking-notes"
          value={state.notes}
          onChange={(e) =>
            setState((prev) => ({ ...prev, notes: e.target.value }))
          }
          disabled={busy}
          placeholder="Ghi nhanh vài từ khoá dự kiến nói..."
          rows={3}
          className="box-border w-full resize-y rounded-xl border border-border-strong bg-surface p-3.5 text-base leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        {!recorder.blob && !recorder.isRecording && (
          <p className="mt-2 text-base leading-relaxed text-text-muted">
            Khi không tiện ghi âm, bạn vẫn có thể nộp nội dung gõ tay — AI sẽ
            góp ý từ vựng & cấu trúc và ghi nhận phát âm là &ldquo;chưa đánh giá
            được&rdquo;.
          </p>
        )}
      </div>
    </>
  );

  return <SessionColumns left={left} right={right} collapsible sourceLabel="Xem tình huống và bản nói trước" />;
}
