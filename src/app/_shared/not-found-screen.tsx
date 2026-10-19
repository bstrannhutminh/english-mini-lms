/**
 * Shared 404 screen for not-found.tsx boundaries (server component).
 * Plain Tailwind, Vietnamese copy.
 */
import Link from "next/link";

interface NotFoundScreenProps {
  title?: string;
  message?: string;
}

export function NotFoundScreen({
  title = "Không tìm thấy trang",
  message = "Trang bạn tìm không tồn tại hoặc đã bị di chuyển. Quay về Hôm nay để tiếp tục buổi học.",
}: NotFoundScreenProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl"
        aria-hidden
      >
        🔍
      </div>
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
      <Link
        href="/today"
        className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Về Hôm nay
      </Link>
    </div>
  );
}
