"use client";

import { RouteErrorScreen } from "./_shared/route-error-screen";

/**
 * global-error replaces the root layout when it throws — must render
 * its own <html>/<body>. Vietnamese UI, plain Tailwind.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <RouteErrorScreen
          title="Ứng dụng gặp lỗi nghiêm trọng"
          message="Đã có lỗi xảy ra ở tầng gốc của ứng dụng. Vui lòng thử tải lại hoặc quay về sau."
          digest={error.digest}
          reset={reset}
        />
      </body>
    </html>
  );
}
