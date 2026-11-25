import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ModePlugin, SessionData, SubmissionResult } from "../modes/types";
import { useSessionTimer } from "../hooks/use-session-timer";
import { useAutosaveDraft } from "../hooks/use-autosave-draft";
import { useSessionEvents } from "../hooks/use-session-events";
import { useSessionEventLifecycle } from "../hooks/use-session-event-lifecycle";
import { useSubmit } from "../hooks/use-submit";
import { useSmartCapture } from "../hooks/use-smart-capture";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useSessionHotkeys } from "../hooks/use-session-hotkeys";
import { requestSessionHint } from "../hooks/request-session-hint";

/** Coordinate draft, timer, submission and overlay state for a learning session. */
export function useSessionController(plugin: ModePlugin, data: SessionData) {
  const router = useRouter();
  const { sessionId } = data;

  const [state, setState] = useState(() => plugin.initialState(data));
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [showWrapUp, setShowWrapUp] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onExpire = useCallback(() => setShowWrapUp(true), []);
  const timer = useSessionTimer(data.targetMinutes, onExpire, sessionId);
  const sessionEvents = useSessionEvents(sessionId);
  const { postEvent } = sessionEvents;
  const {
    toggleTimer: handleToggleTimer,
    markFinished: markSessionFinished,
    pauseForExit: pauseSessionForExit,
    notifyTimerExtended,
  } = useSessionEventLifecycle(timer, sessionEvents);
  const isOnline = useOnlineStatus();

  const autosave = useAutosaveDraft({
    sessionId,
    getContent: () => plugin.buildDraft(stateRef.current),
    enabled: true,
    // Nháp server đang giữ lúc mở phiên — không gõ gì thêm thì autosave
    // không bắn POST nào (tiết kiệm request mỗi 30s khi phiên để mở lâu).
    initialSavedContent: data.initialDraft,
  });

  const { isSubmitting, error: submitError, setError, submit } = useSubmit(sessionId);
  const capture = useSmartCapture();

  const submitCheck = plugin.canSubmit(state);
  const hideActionBar = Boolean(plugin.staysAfterSubmit && submissionResult);

  const handleSubmit = useCallback(async () => {
    if (hintLoading) return;
    const check = plugin.canSubmit(state);
    if (!check.ok) {
      setError(check.reason || "Bài chưa đủ điều kiện nộp.");
      return;
    }
    const result = await submit(
      plugin.buildSubmission(state),
      data.parentId
    );
    setShowWrapUp(false);
    if (result) {
      // finish là fire-and-forget; server cũng ghi finish backup khi nhận submission.
      markSessionFinished();
      timer.stop();
      if (plugin.staysAfterSubmit) {
        setSubmissionResult(result);
      } else {
        router.push(`/my-work/${result.submissionId}`);
      }
    }
  }, [plugin, state, submit, timer, data.parentId, router, setError, hintLoading, markSessionFinished]);

  const handleSaveDraft = useCallback(() => {
    void autosave.saveNow();
  }, [autosave]);

  const handleSaveAndExit = useCallback(async () => {
    setExiting(true);
    try {
      const content = plugin.buildDraft(stateRef.current);
      if (content.trim() && !(await autosave.saveNow())) {
        setError("Chưa lưu được bản nháp. Hãy kiểm tra kết nối và thử lại trước khi thoát.");
        setConfirmExitOpen(false);
        setShowWrapUp(false);
        return;
      }
      pauseSessionForExit();
      setConfirmExitOpen(false);
      router.push("/today");
    } finally {
      setExiting(false);
    }
  }, [autosave, plugin, router, setError, pauseSessionForExit]);

  const handleExtendTimer = useCallback(() => {
    timer.extend(300);
    notifyTimerExtended();
    setShowWrapUp(false);
  }, [timer, notifyTimerExtended]);

  const handleRequestHint = useCallback(async () => {
    if (hintShown || hintLoading) return;
    try {
      setHintLoading(true);
      setHintError(null);
      const accepted = await requestSessionHint(postEvent, () => setHintShown(true));
      if (!accepted) setHintError("Chưa mở được gợi ý vì chưa ghi nhận được sự kiện hỗ trợ. Kiểm tra kết nối rồi thử lại.");
    } catch {
      setHintError("Chưa mở được gợi ý. Kiểm tra kết nối rồi thử lại.");
    } finally {
      setHintLoading(false);
    }
  }, [hintShown, hintLoading, postEvent]);

  const handleEscape = useCallback(() => {
    if (capture.selection) capture.close();
    else if (confirmExitOpen) setConfirmExitOpen(false);
    else setShowWrapUp(false);
  }, [capture, confirmExitOpen]);

  useSessionHotkeys({
    onSaveDraft: handleSaveDraft,
    onSubmit: handleSubmit,
    onEscape: handleEscape,
    canSubmit: submitCheck.ok && !isSubmitting && !hideActionBar,
    enabled: !isSubmitting && !showWrapUp && !confirmExitOpen && !capture.selection,
  });

  const showCaptureSavedToast = useCallback(() => {
    setToast("Đã lưu vào Sổ từ!");
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const onRequestExit = () =>
    submissionResult ? router.push("/today") : setConfirmExitOpen(true);

  return {
    state,
    setState,
    submissionResult,
    showWrapUp,
    confirmExitOpen,
    setConfirmExitOpen,
    exiting,
    hintShown,
    hintLoading,
    hintError,
    toast,
    timer,
    postEvent,
    isOnline,
    autosave,
    isSubmitting,
    submitError,
    capture,
    submitCheck,
    hideActionBar,
    handleSubmit,
    handleSaveDraft,
    handleSaveAndExit,
    handleExtendTimer,
    handleToggleTimer,
    handleRequestHint,
    showCaptureSavedToast,
    onRequestExit,
  };
}
