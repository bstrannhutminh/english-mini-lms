import { Skeleton } from "@/components/ui";

/** Khung xương đúng hình thẻ bài nộp (ô kỹ năng + 3 dòng chữ + huy hiệu). */
export function SubmissionListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Đang tải danh sách bài làm" className="grid items-start gap-3 lg:grid-cols-2 lg:gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-4 sm:gap-4 sm:p-5">
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-7 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
