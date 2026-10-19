"use client";

import { apiFetch } from "@/lib/api-client";
import { uploadMediaResponseSchema } from "@/contracts/media";
import { shadowingResponseSchema } from "@/contracts/session";
import type { SpeakingFeedback } from "@/contracts/submission";

/**
 * Luồng shadowing 2 bước (giữ nguyên contract route hiện có):
 *  1. POST /api/v1/media (FormData) → media_id  — giống speaking.
 *  2. POST /api/v1/sessions/[id]/shadowing { media_id, sentence, ... }
 *     → feedback SpeakingFeedback (server evaluateSpeaking).
 */

/** Upload blob ghi âm lên media store; trả về media_id đã "ready". */
export async function uploadShadowingAudio(
  sessionId: string,
  blob: Blob,
  segmentIndex: number,
): Promise<string> {
  const fileExt = blob.type.includes("mp4") ? "mp4" : "webm";
  const file = new File([blob], `shadowing-${sessionId}-seg${segmentIndex}.${fileExt}`, {
    type: blob.type,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);

  const data = await apiFetch(
    "/api/v1/media",
    { method: "POST", body: formData },
    uploadMediaResponseSchema,
  );
  return data.media_id;
}

/** Gọi chấm phát âm cho một câu shadowing theo media_id đã upload. */
export async function evaluateShadowingSegment(
  sessionId: string,
  params: {
    mediaId: string;
    sentence: string;
    startSeconds: number;
    endSeconds: number;
  },
): Promise<SpeakingFeedback> {
  const data = await apiFetch(
    `/api/v1/sessions/${sessionId}/shadowing`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_id: params.mediaId,
        sentence: params.sentence,
        startSeconds: params.startSeconds,
        endSeconds: params.endSeconds,
      }),
    },
    shadowingResponseSchema,
  );
  return data.feedback;
}
