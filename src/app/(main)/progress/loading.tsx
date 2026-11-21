import { PageContainer } from "@/components/layout";
import { Skeleton, SkeletonText } from "@/components/ui";

/** Khung xương /progress: tiêu đề → 4 ô số liệu → thẻ 4 kỹ năng → điểm cần luyện + so sánh bản sửa. */
export default function ProgressLoading() {
  return (
    <PageContainer className="space-y-5 sm:space-y-6">
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-32 sm:h-9" />
        <Skeleton className="h-5 w-full max-w-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:gap-3 sm:p-5">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-2.5 h-5 w-full max-w-sm" />
        <div className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3.5">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <Skeleton className="h-6 w-56" />
            <SkeletonText lines={4} className="mt-5" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
