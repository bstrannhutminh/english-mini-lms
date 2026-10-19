"use client";

import { useCallback, useEffect, useRef } from "react";
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
 * Vùng làm bài mode Nói (không chrome): cột trái = đối chiếu bản trước +
 * tình huống nói, cột phải = ghi âm + ghi chú (đường nộp text-only).
 *
 * Media flow: ghi xong → panel tự upload POST /api/v1/media ngay → mediaId
 * nằm sẵn trong state để buildSubmission đồng bộ gửi kèm (submission cần
 * mediaId khi có audio thật; text-only → chỉ body → not_assessable).
 */
export function SpeakingPanel(props: ModePanelProps) {
  const { data, busy, capture } = props;
  const { state, setState } = usePluginState<SpeakingModeState>(props);
  const { activity, parentData, sessionId } = data;
  const recorder = useRecorder(300);

  // Chống race: xoá/thu lại trong lúc upload đang bay → bỏ qua kết quả cũ
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
          { type: blob.type },
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
          uploadMediaResponseSchema,
        );
        if (seq !== uploadSeqRef.current) return; // stale — người học đã xoá/thu lại
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
    [sessionId, setState],
  );

  // Upload ngay khi một bản ghi hoàn tất (blob xuất hiện, còn idle)
  useEffect(() => {
    if (recorder.blob && state.mediaStatus === "idle") {
      void uploadAudio(recorder.blob, recorder.durationSeconds);
    }
  }, [recorder.blob, recorder.durationSeconds, state.mediaStatus, uploadAudio]);

  // Đồng bộ cờ đang ghi vào ModeState để canSubmit chặn nộp giữa chừng
  useEffect(() => {
    setState((prev) =>
      prev.isRecording === recorder.isRecording
        ? prev
        : { ...prev, isRecording: recorder.isRecording },
    );
  }, [recorder.isRecording, setState]);

  const handleRetryUpload = useCallback(() => {
    if (recorder.blob) {
      void uploadAudio(recorder.blob, recorder.durationSeconds);
    }
  }, [recorder.blob, recorder.durationSeconds, uploadAudio]);

  const handleClearTake = useCallback(() => {
    uploadSeqRef.current += 1; // vô hiệu mọi upload đang bay
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

      {/* Đề bài / tình huống giao tiếp — bôi đen được để Smart Capture */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 text-[15px] font-bold text-slate-800">
          🗣️ Tình huống nói:
        </div>
        <div
          {...capture.selectHandlers(promptText, sourceRef)}
          className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] leading-relaxed text-slate-700"
        >
          {promptText}
        </div>
        {activity.objective && (
          <p className="mt-2.5 text-sm leading-snug text-slate-600">
            🎯 <strong>Mục tiêu:</strong> {activity.objective}
          </p>
        )}
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

      {/* Ô ghi chú — đồng thời là đường nộp text-only khi micro không khả dụng */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="speaking-notes"
          className="mb-1.5 block text-[13px] font-semibold text-slate-500"
        >
          📝 Ghi chú hoặc bản thảo nháp của bạn (tuỳ chọn):
        </label>
        <textarea
          id="speaking-notes"
          value={state.notes}
          onChange={(e) =>
            setState((prev) => ({ ...prev, notes: e.target.value }))
          }
          disabled={busy}
          placeholder="Bạn có thể gõ các ý chính hoặc nội dung dự kiến nói ở đây nếu muốn..."
          rows={3}
          className="box-border w-full resize-y rounded-lg border border-slate-300 p-3 text-sm leading-relaxed text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
        />
        {!recorder.blob && !recorder.isRecording && (
          <p className="mt-1.5 text-xs leading-snug text-slate-500">
            Không ghi âm được? Nộp chỉ văn bản vẫn được chấm nội dung — nhưng AI
            sẽ không đánh giá được phát âm.
          </p>
        )}
      </div>
    </>
  );

  return <SessionColumns left={left} right={right} />;
}
