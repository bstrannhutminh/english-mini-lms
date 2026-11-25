"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { mediaSignedUrlResponseSchema } from "@/contracts/media";

/**
 * Tải audio đã upload từ draft speaking để nghe lại.
 * Signed-url chỉ sống 10 phút nên hook fetch blob ngay rồi tạo object URL
 * local bền trong suốt phiên; cleanup revoke đúng một lần.
 */
export function useRestoredSpeakingAudio(initialMediaId: string | null) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setAudioUrl(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!initialMediaId) return;
    let cancelled = false;

    async function loadRestoredAudio() {
      try {
        const signed = await apiFetch(
          `/api/v1/media/${initialMediaId}/signed-url`,
          {},
          mediaSignedUrlResponseSchema
        );
        const response = await fetch(signed.signed_url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const audioBlob = await response.blob();
        const objectUrl = URL.createObjectURL(audioBlob);

        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        objectUrlRef.current = objectUrl;
        setAudioUrl(objectUrl);
      } catch (err) {
        console.error("Không khôi phục được audio trong nháp speaking:", err);
        if (!cancelled) {
          setError("Chưa tải được bản ghi đã lưu để nghe lại. Bạn vẫn có thể nộp hoặc thu lại.");
        }
      }
    }

    void loadRestoredAudio();
    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [initialMediaId]);

  return { audioUrl, error, clear };
}
