/**
 * Shared loading screen for loading.tsx boundaries (server-safe —
 * no client hooks needed). Plain Tailwind.
 */
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Đang tải dữ liệu học tập...",
}: LoadingScreenProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
        role="status"
        aria-label="Đang tải"
      />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
