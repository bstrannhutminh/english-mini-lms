import { Skeleton } from "@/components/ui";

/** Khung chờ của thẻ bài học chính — cùng hình với TodayLessonFrame. */
export function TodayLessonSkeleton() {
  return (
    <div role="status" className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7 lg:p-8">
      <span className="sr-only">Đang tải bài học…</span>
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /></div>
      </div>
      <Skeleton className="h-9 w-4/5" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-14 w-full rounded-xl sm:w-64" />
    </div>
  );
}

/** Khung chờ cả trang Hôm nay — dùng cho loading.tsx của route. */
export function TodaySkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-8 w-64" /><Skeleton className="h-5 w-72 max-w-full" /></div>
        <Skeleton className="h-13 w-52 rounded-xl" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        <div className="space-y-6">
          <TodayLessonSkeleton />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
