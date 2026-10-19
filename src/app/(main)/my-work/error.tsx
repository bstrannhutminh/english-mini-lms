"use client";

import { RouteErrorScreen } from "@/app/_shared/route-error-screen";

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorScreen digest={error.digest} reset={reset} />;
}
