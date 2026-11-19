"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  buildYouGlishFallbackUrl,
  normalizeYouGlishQuery,
} from "./youglish";
import {
  loadYouGlishScript,
  SCRIPT_TIMEOUT_MS,
  type YouGlishFetchEvent,
  type YouGlishWidgetInstance,
} from "./youglish-script-loader";

/**
 * YouGlish widget — nghe người bản xứ nói một từ/cụm từ trong video thật.
 *
 * Ghi chú kỹ thuật (đã đối chiếu với widget.js v4.3):
 * - Widget KHÔNG render vào phần tử React: constructor `new YG.Widget(id, ...)` thay thế
 *   `outerHTML` của phần tử có id đó. Vì vậy ta tạo phần tử mount bằng DOM thuần bên trong
 *   một host do React sở hữu (host không có child do React quản lý) → React không bị lệch cây DOM.
 * - Dọn dẹp: `widget.pause()` + `widget.close()` rồi xoá sạch host → iframe (kèm video YouTube
 *   bên trong) bị gỡ khỏi DOM nên audio không phát ngầm.
 * - Script chỉ được nạp khi component được mount (tức khi người học mở panel), không nạp sẵn.
 * - Không cần whitelist CSP: app không đặt CSP (xem next.config.ts).
 */

type WidgetStatus = "loading" | "ready" | "empty" | "error";

interface YouGlishWidgetProps {
  query: string;
}

export function YouGlishWidget({ query }: YouGlishWidgetProps) {
  const cleanQuery = normalizeYouGlishQuery(query);
  const fallbackUrl = buildYouGlishFallbackUrl(cleanQuery);
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const [status, setStatus] = useState<WidgetStatus>("loading");

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !cleanQuery) return;

    let cancelled = false;
    let widget: YouGlishWidgetInstance | null = null;

    const failTimer = window.setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === "loading" ? "error" : s));
    }, SCRIPT_TIMEOUT_MS);

    loadYouGlishScript()
      .then(() => {
        if (cancelled || !window.YG) return;

        const mount = document.createElement("div");
        mount.id = `yg-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-${Date.now()}`;
        host.appendChild(mount);

        widget = new window.YG.Widget(mount.id, {
          query: cleanQuery,
          lang: "english",
          zones: "us,uk,aus",
          autoStart: 0, // tắt autoplay
          backgroundColor: "theme_light",
          events: {
            onFetchDone: (e: YouGlishFetchEvent) => {
              if (cancelled) return;
              window.clearTimeout(failTimer);
              setStatus(e?.totalResult === 0 ? "empty" : "ready");
            },
            onError: () => {
              if (cancelled) return;
              window.clearTimeout(failTimer);
              setStatus("error");
            },
          },
        });
      })
      .catch(() => {
        if (cancelled) return;
        window.clearTimeout(failTimer);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
      try {
        widget?.pause();
        widget?.close();
      } catch {
        // phần tử mount có thể đã bị gỡ — bỏ qua
      }
      // Gỡ iframe → dừng hẳn audio
      host.innerHTML = "";
    };
  }, [cleanQuery, reactId]);

  if (!cleanQuery) {
    return (
      <p className="text-sm text-slate-500">Chưa có từ/cụm từ để tra phát âm.</p>
    );
  }

  const showWidget = status === "loading" || status === "ready";

  return (
    <div className="space-y-3">
      {status === "loading" && (
        <div
          className="flex items-center gap-2 text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500"
            aria-hidden="true"
          />
          Đang tải video người bản xứ…
        </div>
      )}

      {(status === "error" || status === "empty") && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="alert"
        >
          {status === "empty"
            ? `YouGlish chưa có ví dụ cho “${cleanQuery}”.`
            : "Không tải được widget YouGlish (mạng chậm hoặc bị chặn)."}{" "}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-700 underline"
          >
            Mở trên youglish.com ↗
          </a>
        </div>
      )}

      {/* Host do React sở hữu; nội dung bên trong do widget quản lý */}
      <div ref={hostRef} hidden={!showWidget} className="w-full overflow-hidden rounded-xl" />

      {status === "ready" && (
        <p className="text-xs text-slate-500">
          Dùng nút ◀ ▶ trong widget để xem thêm ví dụ.{" "}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-700 underline"
          >
            Mở trên youglish.com ↗
          </a>
        </p>
      )}
    </div>
  );
}
