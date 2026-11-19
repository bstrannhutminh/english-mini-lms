"use client";

import { useEffect, useRef, useState } from "react";

interface UseMediaRecorderArgs {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  onClear: () => void;
  /** Giới hạn thu (giây) — mặc định 300 = 5 phút, khớp upload cap. */
  maxSeconds?: number;
}

export interface MediaRecorderState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  /** UA thuộc trình duyệt in-app (Zalo/FB/Line) — ghi âm hay lỗi quyền. */
  isInAppBrowser: boolean;
  permissionError: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  handleReset: () => void;
}

/** Format giây → MM:SS cho đồng hồ thu âm. */
export function formatRecordTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainder = secs % 60;
  return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function detectInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Zalo/i.test(ua) || /FBAV|FBAN|Line/i.test(ua);
}

/**
 * Vòng đời MediaRecorder: xin quyền micro, chọn MIME tối ưu theo thiết bị,
 * đếm giờ + tự dừng ở maxSeconds, đóng gói blob và gọi onRecordingComplete.
 * UI chỉ render theo state trả về.
 */
export function useMediaRecorder({
  onRecordingComplete,
  onClear,
  maxSeconds = 300,
}: UseMediaRecorderArgs): MediaRecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isInAppBrowser] = useState(detectInAppBrowser);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  function stopRecording() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  async function startRecording() {
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Trình duyệt của bạn không hỗ trợ ghi âm trực tiếp. Hãy mở bằng Safari hoặc Chrome."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Chọn định dạng MIME tối ưu theo thiết bị
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"; // iOS Safari
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      }

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
        setRecordedBlob(audioBlob);
        setAudioUrl(url);

        const finalSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(audioBlob, finalSecs);

        // Tắt tất cả tracks micro
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Thu theo từng chunk 250ms
      setIsRecording(true);
      setDuration(0);
      startTimeRef.current = Date.now();

      // Đếm giờ + tự động dừng khi đạt giới hạn
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxSeconds) {
          stopRecording();
        }
      }, 500);
    } catch (err) {
      console.error("Lỗi khi mở micro:", err);
      setPermissionError(
        err instanceof Error
          ? err.message
          : "Không thể truy cập micro. Hãy cấp quyền trong cài đặt trình duyệt."
      );
    }
  }

  // Clear / Re-record
  function handleReset() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsRecording(false);
    onClear();
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    recordedBlob,
    audioUrl,
    duration,
    isInAppBrowser,
    permissionError,
    startRecording,
    stopRecording,
    handleReset,
  };
}
