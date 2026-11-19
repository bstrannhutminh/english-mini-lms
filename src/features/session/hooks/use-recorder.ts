"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Recorder {
  isRecording: boolean;
  blob: Blob | null;
  /** Object URL nghe lại — thu hồi khi clear/unmount. */
  audioUrl: string | null;
  /** Giây đã ghi (cập nhật mỗi 500ms khi đang ghi). */
  durationSeconds: number;
  /** Lỗi quyền micro / trình duyệt, tiếng Việt. */
  error: string | null;
  /** Trình duyệt in-app (Zalo/FB/Line) — nên khuyên mở trình duyệt ngoài. */
  isInAppBrowser: boolean;
  start: () => Promise<void>;
  stop: () => void;
  clear: () => void;
}

function pickMimeType(): string {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4"; // iOS Safari
  if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
    return "audio/ogg;codecs=opus";
  }
  return "audio/webm";
}

/**
 * Ghi âm bài nói bằng MediaRecorder (tối đa `maxSeconds`, mặc định 5 phút).
 * Port headless từ audio-recorder.tsx — speaking/listening-shadowing dùng.
 */
export function useRecorder(maxSeconds = 300): Recorder {
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInAppBrowser] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /Zalo/i.test(ua) || /FBAV|FBAN|Line/i.test(ua);
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const audioUrlRef = useRef<string | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setIsRecording(false);
  }, [stopTimer]);

  const start = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Trình duyệt của bạn không hỗ trợ ghi âm trực tiếp. Hãy mở bằng Safari hoặc Chrome.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = pickMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        setBlob(audioBlob);
        setAudioUrl(url);
        setDurationSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDurationSeconds(0);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setDurationSeconds(elapsed);
        if (elapsed >= maxSeconds) stop();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi mở micro:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể truy cập micro. Hãy cấp quyền trong cài đặt trình duyệt.",
      );
    }
  }, [maxSeconds, stop]);

  const clear = useCallback(() => {
    stopTimer();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setBlob(null);
    setAudioUrl(null);
    setDurationSeconds(0);
    setIsRecording(false);
  }, [stopTimer]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [stopTimer]);

  return {
    isRecording,
    blob,
    audioUrl,
    durationSeconds,
    error,
    isInAppBrowser,
    start,
    stop,
    clear,
  };
}
