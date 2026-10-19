"use client";

import { RouteErrorScreen } from "@/app/_shared/route-error-screen";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Không mở được trang đăng nhập"
      message="Trang đăng nhập gặp sự cố. Bạn có thể thử lại hoặc tải lại trang."
      digest={error.digest}
      reset={reset}
    />
  );
}
