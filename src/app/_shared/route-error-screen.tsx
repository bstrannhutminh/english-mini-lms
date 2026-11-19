"use client";

/**
 * Shared error screen (plain Tailwind — do NOT use components/ui here;
 * the UI kit belongs to another workstream). Renders a friendly Vietnamese
 * message with a retry action and a link back to "Hôm nay".
 */
import Link from "next/link";

interface RouteErrorScreenProps {
  title?: string;
  message?: string;
  /** Error digest for support/debug (small, muted). */
  digest?: string;
  /** Client-side retry callback (from error.tsx reset). */
  reset?: () => void;
  /** Server-renderable retry — a plain link that reloads the route. */
  retryHref?: string;
}

export function RouteErrorScreen({
  title = "Có lỗi xảy ra",
  message = "Ứng dụng gặp sự cố không mong muốn. Bạn có thể thử lại hoặc quay về trang Hôm nay.",
  digest,
  reset,
  retryHref,
}: RouteErrorScreenProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl"
        aria-hidden
      >
        ⚠️
      </div>
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
      {digest && (
        <p className="mt-3 text-[11px] text-slate-400">
          Mã lỗi: <code className="font-mono">{digest}</code>
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Thử lại
          </button>
        )}
        {!reset && retryHref && (
          <a
            href={retryHref}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Thử lại
          </a>
        )}
        <Link
          href="/today"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Về Hôm nay
        </Link>
      </div>
    </div>
  );
}
