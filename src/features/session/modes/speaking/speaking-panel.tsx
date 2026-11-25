"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownText } from "@/components/ui";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { useRecorder } from "../../hooks/use-recorder";
import { SessionColumns } from "../../shell/session-columns";
import { PROMPT_TEXT_CLASS, SessionBriefCard } from "../../shared/session-brief-card";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { uploadMediaResponseSchema } from "@/contracts/media";
import { SpeakingRecorder } from "./speaking-recorder";
import { SpeakingNotesCard } from "./speaking-notes-card";
import { useRestoredSpeakingAudio } from "./use-restored-speaking-audio";
import { SpeakingParentReference } from "./parent-reference";
import type { SpeakingModeState } from "./state";

/**
 * Vùng làm bài mode Nói: cột trái = đối chiếu bản trước + tình huống nói,
 * cột phải = phòng thu audio (upload → mediaId) + khung ghi chú ý chính
 * (cũng hỗ trợ nộp text-only với invariant pronunciation: not_assessable).
 * Mobile: hai tab "Tình huống" ⇄ "Ghi âm"; phòng thu luôn được mount nên đang
 * ghi âm vẫn xem lại được tình huống (tab có chấm đỏ khi đang thu).
 */
export function SpeakingPanel(props: ModePanelProps) {
  const { data, busy, capture } = props;
  const { state, setState } = usePluginState<SpeakingModeState>(props);
  const { activity, parentData, sessionId } = data;
  const recorder = useRecorder(300);

  const uploadSeqRef = useRef(0);
  // mediaId có trong draft lúc mount — khác với mediaId của take mới upload sau đó.
  const [restoredMediaId] = useState(state.mediaId);
  const {
    audioUrl: restoredAudioUrl,
    error: restoreError,
    clear: clearRestoredAudio,
  } = useRestoredSpeakingAudio(restoredMediaId);

  const uploadAudio = useCallback(
    async (blob: Blob, durationSecs: number) => {
      const seq = ++uploadSeqRef.current;
      setState((prev) => ({
        ...prev,
        mediaStatus: "uploading",
        mediaError: null,
        durationSeconds: Math.max(0, Math.round(durationSecs)),
      }));
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
    clearRestoredAudio();
    setState((prev) => ({
      ...prev,
      mediaStatus: "idle",
      mediaId: null,
      mediaError: null,
      durationSeconds: 0,
    }));
  }, [recorder, clearRestoredAudio, setState]);

  const promptText = activity.promptText || activity.title;
  const sourceRef = `Bài nói: ${activity.slot || activity.id}`;

  const left = (
    <SessionBriefCard
      eyebrow="Đề bài · Tình huống nói"
      title="Chuẩn bị bài nói"
      durationMinutes={activity.durationMinutes}
      objective={activity.objective}
    >
      <div
        {...capture.selectHandlers(promptText, sourceRef, "text")}
        className={PROMPT_TEXT_CLASS}
      >
        <MarkdownText text={promptText} />
      </div>
    </SessionBriefCard>
  );

  const reference = parentData ? (
    <SpeakingParentReference
      parentData={parentData}
      open={state.showParentRef}
      onToggle={() =>
        setState((prev) => ({ ...prev, showParentRef: !prev.showParentRef }))
      }
    />
  ) : undefined;

  const isRestoredTake = Boolean(
    !recorder.blob && restoredMediaId && state.mediaId === restoredMediaId
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
        restoredAudioUrl={isRestoredTake ? restoredAudioUrl : null}
        restoredDurationSeconds={isRestoredTake ? state.durationSeconds : 0}
        restoreError={isRestoredTake ? restoreError : null}
        hasRestoredTake={isRestoredTake}
      />

      <SpeakingNotesCard
        value={state.notes}
        disabled={busy}
        showTextOnlyHint={!recorder.blob && !recorder.isRecording && !isRestoredTake}
        onChange={(notes) => setState((prev) => ({ ...prev, notes }))}
      />
    </>
  );

  return (
    <SessionColumns
      left={left}
      right={right}
      reference={reference}
      referenceLabel={parentData ? `Góp ý bản ${parentData.submission.revision}` : undefined}
      promptLabel="Tình huống"
      answerLabel="Ghi âm"
      answerIcon="mic"
      answerBadge={
        recorder.isRecording ? (
          <span className="inline-flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-600">
            <span className="sr-only">đang ghi âm</span>
          </span>
        ) : undefined
      }
      startLabel="Sẵn sàng ghi âm"
      startOnAnswer={Boolean(data.initialDraft || data.parentId)}
    />
  );
}
