"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ModePlugin,
  SessionData,
  SubmissionResult,
} from "../modes/types";
import { useSessionTimer } from "../hooks/use-session-timer";
import { useAutosaveDraft } from "../hooks/use-autosave-draft";
import { useSessionEvents } from "../hooks/use-session-events";
import { useSubmit } from "../hooks/use-submit";
import { useSmartCapture } from "../hooks/use-smart-capture";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useSessionHotkeys } from "../hooks/use-session-hotkeys";
import { ShellHeader } from "./shell-header";
import { OfflineBanner } from "./offline-banner";
import { HintBar } from "./hint-bar";
import { ActionBar } from "./action-bar";
import { ShellOverlays } from "./shell-overlays";

/**
 * Khung phiên học dùng chung (đặc tả §3.4): header + chip kỹ năng/IELTS,
 * đồng hồ tạm dừng/tiếp tục, chỉ báo tự lưu, thang gợi ý, cảnh báo mất mạng,
 * Smart Capture khi bôi đen, phím tắt, modal kết thúc, thanh hành động dính đáy.
 * Phần làm bài do `plugin.Panel` render; `assisted` do server tính.
 */
export function SessionShell({
  plugin,
  isIelts,
  data,
}: {
  plugin: ModePlugin;
  isIelts: boolean;
  data: SessionData;
}) {
  const router = useRouter();
  const { sessionId } = data;

  // Mode state — shell giữ hộ, plugin sở hữu hình dạng qua usePluginState
  const [state, setState] = useState(() => plugin.initialState(data));
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [showWrapUp, setShowWrapUp] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useSessionTimer(data.targetMinutes, useCallback(() => setShowWrapUp(true), []));
  const { postEvent } = useSessionEvents(sessionId);
  const isOnline = useOnlineStatus();

  const autosave = useAutosaveDraft({
    sessionId,
    getContent: () => plugin.buildDraft(stateRef.current),
    enabled: true,
  });

  const { isSubmitting, error: submitError, setError, submit } = useSubmit(sessionId);
  const capture = useSmartCapture();

  const submitCheck = plugin.canSubmit(state);

  const handleSubmit = useCallback(async () => {
    const check = plugin.canSubmit(state);
    if (!check.ok) {
      setError(check.reason || "Bài chưa đủ điều kiện nộp.");
      return;
    }
    timer.stop();
    const result = await submit(
      plugin.buildSubmission(state),
      data.parentId,
    );
    if (result) {
      // Plugin ở lại trang (listening: xem đáp án + shadowing) — Panel tự
      // render màn kết quả từ `submission`; các mode khác sang /my-work.
      if (plugin.staysAfterSubmit) {
        setSubmissionResult(result);
      } else {
        router.push(`/my-work/${result.submissionId}`);
      }
    }
  }, [plugin, state, submit, timer, data.parentId, router, setError]);

  const handleSaveDraft = useCallback(() => {
    void autosave.saveNow();
  }, [autosave]);

  const handleSaveAndExit = useCallback(async () => {
    await autosave.saveNow();
    router.push("/today");
  }, [autosave, router]);

  const handleExtendTimer = useCallback(() => {
    timer.extend(300);
    setShowWrapUp(false);
  }, [timer]);

  const handleRequestHint = useCallback(async () => {
    if (hintShown || hintLoading) return;
    try {
      setHintLoading(true);
      await postEvent("hint");
      setHintShown(true);
    } finally {
      setHintLoading(false);
    }
  }, [hintShown, hintLoading, postEvent]);

  const handleEscape = useCallback(() => {
    if (capture.selection) capture.close();
    else setShowWrapUp(false);
  }, [capture]);

  useSessionHotkeys({
    onSaveDraft: handleSaveDraft,
    onSubmit: handleSubmit,
    onEscape: handleEscape,
    canSubmit: submitCheck.ok && !isSubmitting,
  });

  const showCaptureSavedToast = useCallback(() => {
    setToast("Đã lưu vào Sổ từ!");
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Dọn timer toast khi unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const HintContent = plugin.Hint;
  const overlayCopy = plugin.submittingCopy ?? {
    title: "Hệ thống đang chấm bài của bạn...",
    description:
      "Đang phân tích bài làm theo rubric. Quá trình mất khoảng 15–30 giây.",
  };

  return (
    <div className="mx-auto w-full max-w-[768px] px-4 pb-10 pt-4 lg:max-w-[1200px]">
      <ShellOverlays
        isSubmitting={isSubmitting}
        submitTitle={overlayCopy.title}
        submitDescription={overlayCopy.description}
        toast={toast}
        captureSelection={capture.selection}
        onCaptureClose={capture.close}
        onCaptureSaved={showCaptureSavedToast}
        wrapUpOpen={showWrapUp}
        targetMinutes={data.targetMinutes}
        canSubmit={submitCheck.ok}
        isSaving={autosave.isSaving}
        onSaveAndExit={handleSaveAndExit}
        onSubmit={handleSubmit}
        onExtend={handleExtendTimer}
      />

      <ShellHeader
        title={data.activity.title}
        skill={plugin.skill}
        isIelts={isIelts}
        isRevision={Boolean(data.parentId)}
        timerFormatted={timer.formatted}
        timerActive={timer.isActive}
        isLowTime={timer.secondsRemaining < 300}
        onToggleTimer={timer.toggle}
        onSaveAndExit={handleSaveAndExit}
        saveStatus={{
          lastSavedAt: autosave.lastSavedAt,
          isSaving: autosave.isSaving,
          saveFailed: autosave.saveFailed,
          onRetrySave: handleSaveDraft,
        }}
      />

      <OfflineBanner isOnline={isOnline} onRetrySave={handleSaveDraft} />

      {HintContent && (
        <HintBar
          label={plugin.hintLabel ?? "Xin gợi ý"}
          shown={hintShown}
          loading={hintLoading}
          onRequest={handleRequestHint}
        >
          <HintContent data={data} />
        </HintBar>
      )}

      <plugin.Panel
        data={data}
        state={state}
        setState={setState}
        busy={isSubmitting}
        postEvent={postEvent}
        capture={capture.helpers}
        submission={submissionResult}
      />

      <ActionBar
        canSubmit={submitCheck.ok}
        submitDisabledReason={submitCheck.reason}
        isSubmitting={isSubmitting}
        isSaving={autosave.isSaving}
        submitError={submitError}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        submitLabel={plugin.submitLabel}
      />
    </div>
  );
}
