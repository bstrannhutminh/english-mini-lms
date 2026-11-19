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
  narrow: "max-w-xl",
  default: "max-w-2xl lg:max-w-4xl",
  wide: "max-w-2xl lg:max-w-6xl",
} as const;

/**
 * Container nội dung chuẩn của mọi trang trong (main): căn giữa, padding
 * ngang 16px, rộng tối đa theo `size`. Trang chỉ việc đặt <PageContainer>.
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
        padded && "px-4 py-6 sm:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
