/**
 * Shared loading screen for loading.tsx boundaries (server-safe —
 * no client hooks needed). Plain Tailwind.
 */
import { Spinner } from "@/components/ui";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Đang tải dữ liệu học tập...",
}: LoadingScreenProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-5 px-5 py-12 text-center">
      <Spinner size="lg" label="Đang tải" className="text-primary" />
      <p className="text-base leading-relaxed text-text-secondary">{message}</p>
    </div>
  );
}
