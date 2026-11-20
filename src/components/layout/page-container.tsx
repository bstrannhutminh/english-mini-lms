import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface PageContainerProps {
  children: ReactNode;
  /** "default" = đọc/viết; "narrow" = form/onboarding; "wide" = bảng admin. */
  size?: "narrow" | "default" | "wide";
  /** Bỏ padding dọc mặc định khi trang tự quản nhịp (vd. khung phiên học). */
  padded?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  narrow: "max-w-2xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

/**
 * Container nội dung chuẩn của mọi trang trong (main): căn giữa, padding
 * ngang 20/24/32px, rộng tối đa theo `size`.
 */
export function PageContainer({
  children,
  size = "default",
  padded = true,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        SIZE_CLASSES[size],
        padded && "px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        className
      )}
    >
      {children}
    </div>
  );
}
