"use client";

/**
 * Shared error boundary with a retry action and a link back to Hôm nay.
 */
import Link from "next/link";
import { Button, Icon } from "@/components/ui";

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
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center text-red-700"
        aria-hidden
      >
        <Icon name="alert-triangle" className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">{message}</p>
      {digest && (
        <p className="mt-4 break-all text-sm text-text-muted">
          Mã lỗi: <code className="font-mono">{digest}</code>
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button
            onClick={reset}
            size="lg"
          >
            Thử lại
          </Button>
        )}
        {!reset && retryHref && (
          <a
            href={retryHref}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Thử lại
          </a>
        )}
        <Link
          href="/today"
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border-strong bg-surface px-5 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-surface-subtle"
        >
          Về Hôm nay
        </Link>
      </div>
    </div>
  );
}
