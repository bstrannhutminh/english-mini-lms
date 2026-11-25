"use client";

import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { createSessionEventRequestSchema, createSessionEventResponseSchema } from "@/contracts/session";

export type SessionEventKind = "hint" | "reveal" | "pause" | "resume" | "finish";

export interface SessionEvents {
  /** Ghi event → POST /api/v1/sessions/[id]/events. Trả false nếu lỗi. */
  postEvent: (
    kind: SessionEventKind,
    payload?: Record<string, unknown>,
  ) => Promise<boolean>;
  /**
   * Ghi event khi sắp rời trang bằng sendBeacon/fetch keepalive.
   * Không đọc response nên chỉ dùng cho pause/fire-and-forget.
   */
  postEventReliable: (
    kind: SessionEventKind,
    payload?: Record<string, unknown>,
  ) => void;
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
        const body = createSessionEventRequestSchema.parse({ kind, payload });
        await apiFetch(`/api/v1/sessions/${sessionId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }, createSessionEventResponseSchema);
        return true;
      } catch (err) {
        console.error(`Lỗi khi ghi sự kiện "${kind}":`, err);
        return false;
      } finally {
        setPosting(false);
      }
    },
    [sessionId],
  );

  // Dùng cho các nhánh sắp rời trang: ưu tiên sendBeacon, fallback fetch
  // keepalive. Lỗi chỉ log, tuyệt đối không làm sập luồng nộp/thoát.
  const postEventReliable = useCallback(
    (kind: SessionEventKind, payload?: Record<string, unknown>) => {
      try {
        const body = createSessionEventRequestSchema.parse({ kind, payload });
        const raw = JSON.stringify(body);
        const url = `/api/v1/sessions/${sessionId}/events`;

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const sent = navigator.sendBeacon(
            url,
            new Blob([raw], { type: "application/json" })
          );
          if (sent) return;
        }

        void fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: raw,
          keepalive: true,
        }).catch((err) => {
          console.error(`Lỗi khi ghi sự kiện "${kind}" lúc rời trang:`, err);
        });
      } catch (err) {
        console.error(`Payload sự kiện "${kind}" không hợp lệ:`, err);
      }
    },
    [sessionId]
  );

  return { postEvent, postEventReliable, posting };
}
