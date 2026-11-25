"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { assessmentStatusResponseSchema } from "@/contracts/submission";

/** Trạng thái assessment còn "sống" — đáng để tự động làm mới trang. */
const ACTIVE_STATUSES = new Set(["queued", "processing"]);

const POLL_INTERVAL_MS = 6_000;
/** Dừng tự cập nhật sau ~5 phút để tránh poll vô hạn khi tab mở lâu. */
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

/** true khi assessment vẫn đang chấm — tiếp tục poll, chưa cần refresh. */
export function isAssessmentActive(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}

/**
 * Poll endpoint nhẹ GET /api/v1/assessments/[id]/status mỗi 6s khi assessment
 * còn queued/processing, CHỈ router.refresh() (re-render server full trang)
 * đúng một lần khi trạng thái rời nhóm active — feedback_ready/failed/needs_input.
 * Trước đây refresh full trang mỗi tick → chạy lại toàn bộ chuỗi truy vấn
 * server (~8-10 roundtrip) suốt mấy phút chấm bài.
 * Trả { polling, timedOut, refresh } để banner hiển thị đúng trạng thái.
 */
export function useAssessmentPolling(
  status: string | null | undefined,
  assessmentId: string | null | undefined
) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number | null>(null);

  const active = Boolean(status && ACTIVE_STATUSES.has(status) && assessmentId);

  useEffect(() => {
    if (!active || timedOut || !assessmentId) return;
    startedAt.current = Date.now();

    let stopped = false;
    let inFlight = false;

    const interval = setInterval(() => {
      if (Date.now() - (startedAt.current ?? 0) > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }
      if (inFlight) return;
      inFlight = true;
      apiFetch(
        `/api/v1/assessments/${assessmentId}/status`,
        undefined,
        assessmentStatusResponseSchema
      )
        .then(({ status: polled }) => {
          if (stopped) return;
          if (!ACTIVE_STATUSES.has(polled)) {
            // Trạng thái terminal: refresh đúng một lần để feedback/lỗi hiện ra.
            stopped = true;
            clearInterval(interval);
            router.refresh();
          }
        })
        .catch(() => {
          // Lỗi mạng/server tạm thời — bỏ qua, tick sau thử lại.
        })
        .finally(() => {
          inFlight = false;
        });
    }, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [active, timedOut, router, assessmentId]);

  return {
    polling: active && !timedOut,
    timedOut,
    refresh: () => router.refresh(),
  };
}
