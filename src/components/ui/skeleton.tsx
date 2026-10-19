import { cn } from "@/lib/utils";

export interface SkeletonProps {
  /** Kích thước/hình dạng qua class, ví dụ "h-4 w-1/2", "h-24 w-full rounded-2xl". */
  className?: string;
}

/** Khối xương tải trang — trang trí thuần, screen reader bỏ qua. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-slate-200/80", className)}
    />
  );
}

/** Nhóm Skeleton dạng đoạn văn — `lines` dòng, dòng cuối ngắn hơn. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
