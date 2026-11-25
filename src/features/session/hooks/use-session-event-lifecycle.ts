"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SessionTimer } from "./use-session-timer";
import type { SessionEvents } from "./use-session-events";
import {
  manualTimerEvent,
  resolveVisibilityEvent,
  shouldSendTimeoutPause,
} from "./session-event-policy";

export interface SessionEventLifecycle {
  /** Nút pause/play trên header — đồng bộ local timer và ghi event tương ứng. */
  toggleTimer: () => void;
  /** Nộp bài thành công: finish chỉ gửi một lần và chặn pause/resume đến muộn. */
  markFinished: () => void;
  /** Lưu nháp rồi thoát bằng điều hướng nội bộ (không qua pagehide). */
  pauseForExit: () => void;
  /** Học thêm sau khi hết giờ: mở lại đoạn active nếu timeout đã ghi pause. */
  notifyTimerExtended: () => void;
}

/**
 * Nối timer local với session_events. Mọi POST đều fire-and-forget (postEvent
 * đã nuốt lỗi) để không bao giờ chặn nộp bài/thoát phiên; server là nơi chống
 * double-count nhờ state machine + khoá hàng trong transaction.
 */
export function useSessionEventLifecycle(
  timer: SessionTimer,
  events: Pick<SessionEvents, "postEvent" | "postEventReliable">
): SessionEventLifecycle {
  const { postEvent, postEventReliable } = events;
  const timerRef = useRef(timer);
  const postEventRef = useRef(postEvent);
  const reliableRef = useRef(postEventReliable);
  const autoPausedRef = useRef(false);
  const finishedRef = useRef(false);
  const timeoutPauseSentRef = useRef(false);

  useEffect(() => {
    timerRef.current = timer;
    postEventRef.current = postEvent;
    reliableRef.current = postEventReliable;
  });

  // Ẩn/hiện tab hoặc app mobile. Chỉ visibility tự resume khi chính nó đã
  // auto-pause; pause tay của người học không bị đè.
  useEffect(() => {
    function onVisibilityChange() {
      const decision = resolveVisibilityEvent({
        visibility: document.visibilityState === "hidden" ? "hidden" : "visible",
        timerActive: timerRef.current.isActive,
        autoPaused: autoPausedRef.current,
        finished: finishedRef.current,
      });

      autoPausedRef.current = decision.autoPaused;
      if (decision.pauseTimer) timerRef.current.pause();
      if (decision.resumeTimer) timerRef.current.resume();
      if (decision.event) {
        void postEventRef.current(decision.event, { source: "visibilitychange" });
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Đóng tab/reload/điều hướng cứng. sendBeacon không đọc được response nhưng
  // đây đúng là nhánh fire-and-forget; server xử lý pause lặp an toàn.
  useEffect(() => {
    function pauseOnUnload() {
      if (finishedRef.current || !timerRef.current.isActive) return;
      reliableRef.current("pause", { source: "unload" });
    }

    window.addEventListener("pagehide", pauseOnUnload);
    window.addEventListener("beforeunload", pauseOnUnload);
    return () => {
      window.removeEventListener("pagehide", pauseOnUnload);
      window.removeEventListener("beforeunload", pauseOnUnload);
    };
  }, []);

  // Timeout đóng đoạn active tại đúng thời điểm hết giờ. Khi learner chọn
  // "học thêm 5 phút", notifyTimerExtended sẽ ghi resume để mở đoạn mới.
  const expired = timer.secondsRemaining === 0;
  useEffect(() => {
    if (!expired) return;
    if (
      shouldSendTimeoutPause({
        finished: finishedRef.current,
        alreadySent: timeoutPauseSentRef.current,
      })
    ) {
      timeoutPauseSentRef.current = true;
      autoPausedRef.current = false;
      void postEvent("pause", { source: "timeout" });
    }
  }, [expired, postEvent]);

  const toggleTimer = useCallback(() => {
    const current = timerRef.current;
    if (finishedRef.current || current.secondsRemaining <= 0) return;
    // peekPaused đọc clock ref tức thời — isActive là React state và có thể
    // stale nếu learner double-click trong cùng một tick.
    const kind = manualTimerEvent(!current.peekPaused());
    if (kind === "pause") {
      autoPausedRef.current = false;
      current.pause();
    } else {
      current.resume();
    }
    void postEventRef.current(kind, { source: "manual" });
  }, []);

  const markFinished = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    autoPausedRef.current = false;
    timeoutPauseSentRef.current = false;
    void postEventRef.current("finish", { source: "submit" });
  }, []);

  const pauseForExit = useCallback(() => {
    if (finishedRef.current) return;
    const wasActive = timerRef.current.isActive;
    timerRef.current.pause();
    autoPausedRef.current = false;
    if (wasActive) reliableRef.current("pause", { source: "save_and_exit" });
  }, []);

  const notifyTimerExtended = useCallback(() => {
    if (finishedRef.current || !timeoutPauseSentRef.current) return;
    timeoutPauseSentRef.current = false;
    autoPausedRef.current = false;
    void postEventRef.current("resume", { source: "extend" });
  }, []);

  return { toggleTimer, markFinished, pauseForExit, notifyTimerExtended };
}
