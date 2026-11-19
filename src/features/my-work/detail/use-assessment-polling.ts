"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Trạng thái assessment còn "sống" — đáng để tự động làm mới trang. */
const ACTIVE_STATUSES = new Set(["queued", "processing"]);

const POLL_INTERVAL_MS = 6_000;
/** Dừng tự cập nhật sau ~5 phút để tránh poll vô hạn khi tab mở lâu. */
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Tự động router.refresh() mỗi 6s khi assessment còn queued/processing.
 * Server component re-render → feedback xuất hiện khi chấm xong mà
 * người học không phải bấm nút. Trả { polling, timedOut } để banner
 * hiển thị đúng trạng thái.
 */
export function useAssessmentPolling(status: string | null | undefined) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number | null>(null);

  const active = Boolean(status && ACTIVE_STATUSES.has(status));

  useEffect(() => {
    if (!active || timedOut) return;
    startedAt.current = Date.now();

    const interval = setInterval(() => {
      if (Date.now() - (startedAt.current ?? 0) > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [active, timedOut, router]);

  return {
    polling: active && !timedOut,
    timedOut,
    refresh: () => router.refresh(),
  };
}
