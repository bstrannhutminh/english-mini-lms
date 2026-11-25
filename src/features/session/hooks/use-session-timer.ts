"use client";

import { useEffect, useRef, useState } from "react";
import { clearPersistedTimer, readPersistedTimer, writePersistedTimer } from "./timer-storage";

export interface SessionTimer {
  secondsRemaining: number;
  isActive: boolean;
  formatted: string;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  /** Mở một khoảng học thêm mới sau khi hết giờ. */
  extend: (seconds: number) => void;
  stop: () => void;
  /** Đọc trạng thái paused tức thời từ clock ref — tránh stale state khi double-click. */
  peekPaused: () => boolean;
}

/** Deadline giữ thời gian chính xác khi trình duyệt trì hoãn tick hoặc chạy lại effect. */
export function useSessionTimer(
  targetMinutes: number,
  onExpire?: () => void,
  sessionId?: string,
): SessionTimer {
  const [remaining, setRemaining] = useState(targetMinutes * 60);
  const [active, setActive] = useState(true);
  const clock = useRef({ deadline: 0, remaining: targetMinutes * 60, paused: false, stopped: false });

  useEffect(() => {
    const saved = sessionId ? readPersistedTimer(sessionId) : null;
    const seconds = saved?.secondsRemaining ?? targetMinutes * 60;
    const paused = saved?.paused ?? false;
    clock.current = { deadline: Date.now() + seconds * 1000, remaining: seconds, paused, stopped: false };
    if (sessionId && !saved) writePersistedTimer(sessionId, seconds, paused);

    function sync() {
      const current = clock.current;
      if (!current.paused && !current.stopped) {
        current.remaining = Math.max(0, Math.ceil((current.deadline - Date.now()) / 1000));
      }
      setRemaining(current.remaining);
      setActive(!current.paused && !current.stopped && current.remaining > 0);
    }
    // Every setup restores state, including Strict Mode effect replay.
    const initial = setTimeout(sync, 0);
    const interval = setInterval(sync, 1000);
    const onVisibility = () => { if (document.visibilityState === "visible") sync(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sessionId, targetMinutes]);

  const expired = remaining === 0;
  useEffect(() => { if (expired) onExpire?.(); }, [expired, onExpire]);

  function setPaused(paused: boolean) {
    const current = clock.current;
    if (current.stopped) return;
    if (!current.paused) current.remaining = Math.max(0, Math.ceil((current.deadline - Date.now()) / 1000));
    current.paused = paused;
    if (!paused) current.deadline = Date.now() + current.remaining * 1000;
    setRemaining(current.remaining);
    setActive(!paused && current.remaining > 0);
    if (sessionId) writePersistedTimer(sessionId, current.remaining, paused);
  }

  return {
    secondsRemaining: remaining,
    isActive: active && remaining > 0,
    formatted: `${Math.floor(remaining / 60).toString().padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    toggle: () => setPaused(!clock.current.paused),
    extend: (seconds) => {
      const value = Math.max(0, Math.floor(seconds));
      clock.current = { deadline: Date.now() + value * 1000, remaining: value, paused: false, stopped: false };
      setRemaining(value);
      setActive(value > 0);
      if (sessionId) writePersistedTimer(sessionId, value, false);
    },
    stop: () => {
      clock.current.stopped = true;
      setActive(false);
      if (sessionId) clearPersistedTimer(sessionId);
    },
    peekPaused: () => clock.current.paused,
  };
}
