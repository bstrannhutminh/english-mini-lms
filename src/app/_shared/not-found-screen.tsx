/**
 * Shared 404 screen for not-found.tsx boundaries (server component).
 * Plain Tailwind, Vietnamese copy.
 */
import Link from "next/link";
import { Icon } from "@/components/ui";

interface NotFoundScreenProps {
  title?: string;
  message?: string;
}

export function NotFoundScreen({
  title = "Không tìm thấy trang",
  message = "Trang bạn tìm không tồn tại hoặc đã bị di chuyển. Quay về Hôm nay để tiếp tục buổi học.",
}: NotFoundScreenProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center text-text-muted"
        aria-hidden
      >
        <Icon name="search" className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">{message}</p>
      <Link
        href="/today"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Về Hôm nay
      </Link>
    </div>
  );
}
