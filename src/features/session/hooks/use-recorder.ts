"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isIosUserAgent,
  recorderErrorMessage,
} from "./recorder-error-message";
import {
  isInAppUserAgent,
  pickRecorderMimeType,
} from "./recorder-support";

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

/**
 * Ghi âm bài nói bằng MediaRecorder (tối đa `maxSeconds`, mặc định 5 phút).
 * Hook headless (không kèm giao diện) — speaking/listening-shadowing dùng.
 */
export function useRecorder(maxSeconds = 300): Recorder {
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInAppBrowser] = useState(() => {
    if (typeof window === "undefined") return false;
    return isInAppUserAgent(navigator.userAgent || "");
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const audioUrlRef = useRef<string | null>(null);
  /** true khi stop do clear/unmount — không được tạo blob hay setState muộn. */
  const discardRecordingRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    } else {
      // Recorder đã inactive/nhưng stream còn treo (lỗi khởi tạo, race unmount).
      stopTracks();
    }
    setIsRecording(false);
  }, [stopTimer, stopTracks]);

  const start = useCallback(async () => {
    if (mediaRecorderRef.current?.state === "recording") return;
    setError(null);
    audioChunksRef.current = [];
    discardRecordingRef.current = false;

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
      streamRef.current = stream;

      const mimeType = pickRecorderMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopTracks();
        mediaRecorderRef.current = null;

        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        setBlob(audioBlob);
        setAudioUrl(url);
        setDurationSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
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
      stopTracks();
      mediaRecorderRef.current = null;
      console.error("Lỗi khi mở micro:", err);
      // Luôn map sang tiếng Việt theo nền tảng (iOS khác desktop) — không
      // hiển thị raw error trình duyệt. iOS chỉ cần khi có lỗi nên đo tại đây.
      const isIos = isIosUserAgent(
        navigator.userAgent || "",
        navigator.maxTouchPoints ?? 0,
      );
      setError(recorderErrorMessage(err, isIos));
    }
  }, [maxSeconds, stop, stopTracks]);

  const clear = useCallback(() => {
    // Nếu đang thu mà learner chọn "Thu lại", bản ghi hiện tại bị bỏ hoàn toàn.
    if (mediaRecorderRef.current?.state === "recording") {
      discardRecordingRef.current = true;
    }
    stop();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setBlob(null);
    setAudioUrl(null);
    setDurationSeconds(0);
    setIsRecording(false);
  }, [stop]);

  // Cleanup khi unmount: dừng MediaRecorder + tắt track micro ngay cả khi
  // learner thoát giữa chừng qua timeout/save-exit/submit/điều hướng nội bộ.
  useEffect(() => {
    return () => {
      discardRecordingRef.current = true;
      stopTimer();
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        rec.stop();
      } else {
        stopTracks();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [stopTimer, stopTracks]);

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
