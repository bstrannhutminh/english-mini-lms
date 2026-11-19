import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ModePlugin, SessionData, SubmissionResult } from "../modes/types";
import { useSessionTimer } from "../hooks/use-session-timer";
import { useAutosaveDraft } from "../hooks/use-autosave-draft";
import { useSessionEvents } from "../hooks/use-session-events";
import { useSubmit } from "../hooks/use-submit";
import { useSmartCapture } from "../hooks/use-smart-capture";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useSessionHotkeys } from "../hooks/use-session-hotkeys";

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
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onExpire = useCallback(() => setShowWrapUp(true), []);
  const timer = useSessionTimer(data.targetMinutes, onExpire, sessionId);
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
  const hideActionBar = Boolean(plugin.staysAfterSubmit && submissionResult);

  const handleSubmit = useCallback(async () => {
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
      timer.stop();
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
    setExiting(true);
    try {
      const content = plugin.buildDraft(stateRef.current);
      if (content.trim() && !(await autosave.saveNow())) {
        setError("Chưa lưu được bản nháp. Hãy kiểm tra kết nối và thử lại trước khi thoát.");
        setConfirmExitOpen(false);
        setShowWrapUp(false);
        return;
      }
      timer.pause();
      setConfirmExitOpen(false);
      router.push("/today");
    } finally {
      setExiting(false);
    }
  }, [autosave, plugin, router, setError, timer]);

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
    else if (confirmExitOpen) setConfirmExitOpen(false);
    else setShowWrapUp(false);
  }, [capture, confirmExitOpen]);

  useSessionHotkeys({
    onSaveDraft: handleSaveDraft,
    onSubmit: handleSubmit,
    onEscape: handleEscape,
    canSubmit: submitCheck.ok && !isSubmitting && !hideActionBar,
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
    handleRequestHint,
    showCaptureSavedToast,
    onRequestExit,
  };
}
