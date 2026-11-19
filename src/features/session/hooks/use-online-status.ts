"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Theo dõi online/offline để shell hiện cảnh báo mất mạng + nút thử lại.
 * Server snapshot luôn là `true`: Node ≥ 21 có global `navigator` nhưng
 * `navigator.onLine` là undefined — đọc nó lúc SSR làm banner "Mất kết nối"
 * lọt vào HTML và gây hydration mismatch.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
