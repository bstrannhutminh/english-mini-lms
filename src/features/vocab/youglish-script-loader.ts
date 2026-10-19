/**
 * Loader script widget YouGlish — nạp đúng 1 lần, share giữa các lần mở modal.
 * Đã đối chiếu với widget.js v4.3: script expose global `window.YG.Widget`.
 */
import { YOUGLISH_SCRIPT_URL } from "./youglish";

export interface YouGlishWidgetInstance {
  pause: () => void;
  close: () => void;
}

export interface YouGlishFetchEvent {
  totalResult?: number;
}

export interface YouGlishGlobal {
  Widget: new (
    containerId: string,
    options: Record<string, unknown>
  ) => YouGlishWidgetInstance;
}

declare global {
  interface Window {
    YG?: YouGlishGlobal;
  }
}

export const SCRIPT_TIMEOUT_MS = 10_000;

let scriptPromise: Promise<void> | null = null;

/** Nạp script YouGlish đúng 1 lần (dùng chung giữa các lần mở panel). */
export function loadYouGlishScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouGlish chỉ chạy trên trình duyệt"));
  }
  if (window.YG?.Widget) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = YOUGLISH_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.YG?.Widget) {
        resolve();
      } else {
        script.remove();
        reject(new Error("Script YouGlish đã tải nhưng thiếu YG.Widget"));
      }
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Không tải được script YouGlish"));
    };
    document.head.appendChild(script);
  }).catch((err) => {
    // Cho phép thử lại ở lần mở panel kế tiếp
    scriptPromise = null;
    throw err;
  });

  return scriptPromise;
}
