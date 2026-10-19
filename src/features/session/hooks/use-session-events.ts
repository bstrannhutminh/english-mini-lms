"use client";

import { useCallback, useState } from "react";

export type SessionEventKind = "hint" | "reveal" | "pause" | "resume" | "finish";

export interface SessionEvents {
  /** Ghi event → POST /api/v1/sessions/[id]/events. Trả false nếu lỗi. */
  postEvent: (
    kind: SessionEventKind,
    payload?: Record<string, unknown>,
  ) => Promise<boolean>;
  posting: boolean;
}

/**
 * Client chỉ GHI event; `assisted` luôn do server suy ra từ
 * session_events (hint/reveal trước nộp) — tuyệt đối không gửi trường đó.
 */
export function useSessionEvents(sessionId: string): SessionEvents {
  const [posting, setPosting] = useState(false);

  const postEvent = useCallback(
    async (
      kind: SessionEventKind,
      payload?: Record<string, unknown>,
    ): Promise<boolean> => {
      try {
        setPosting(true);
        const res = await fetch(`/api/v1/sessions/${sessionId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, payload }),
        });
        return res.ok;
      } catch (err) {
        console.error(`Lỗi khi ghi sự kiện "${kind}":`, err);
        return false;
      } finally {
        setPosting(false);
      }
    },
    [sessionId],
  );

  return { postEvent, posting };
}
