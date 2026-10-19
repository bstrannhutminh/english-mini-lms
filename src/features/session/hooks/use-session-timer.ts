"use client";

import { useEffect, useState } from "react";

export interface SessionTimer {
  secondsRemaining: number;
  isActive: boolean;
  formatted: string; // "MM:SS"
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  /** Thêm thời gian mới và chạy tiếp (dùng cho "Học thêm 5 phút"). */
  extend: (seconds: number) => void;
  /** Dừng hẳn khi nộp bài. */
  stop: () => void;
}

/**
 * Đồng hồ đếm ngược của phiên học. Hết giờ → tự dừng + gọi onExpire
 * (shell mở wrap-up modal). Chỉ đếm phía client; không ghi event
 * pause/resume vì today chỉ nhặt nháp dở của session còn "active".
 */
export function useSessionTimer(
  targetMinutes: number,
  onExpire?: () => void,
): SessionTimer {
  const [secondsRemaining, setSecondsRemaining] = useState(targetMinutes * 60);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  const isActive = !paused && !stopped && secondsRemaining > 0;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Hết giờ → báo shell mở modal (tự chạy lại sau mỗi lần extend rồi hết giờ)
  const expired = secondsRemaining === 0;
  useEffect(() => {
    if (expired) onExpire?.();
  }, [expired, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return {
    secondsRemaining,
    isActive,
    formatted: `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    toggle: () => setPaused((v) => !v),
    extend: (seconds) => {
      setSecondsRemaining(seconds);
      setPaused(false);
      setStopped(false);
    },
    stop: () => setStopped(true),
  };
}
