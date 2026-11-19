"use client";

import { RouteErrorScreen } from "./_shared/route-error-screen";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorScreen digest={error.digest} reset={reset} />;
}
