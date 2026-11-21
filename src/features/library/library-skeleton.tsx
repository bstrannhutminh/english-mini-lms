import { Skeleton, SkeletonText } from "@/components/ui";
import { PageContainer } from "@/components/layout";

/** Một thẻ bài học dạng xương — cùng kích thước với ActivityCard. */
function ActivityCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-40 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-4/5" />
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

/** Khung xương trang Thư viện: tiêu đề, ô tìm, hàng tab, hàng chip và lưới thẻ 1/2/3 cột. */
export function LibrarySkeleton() {
  return (
    <PageContainer size="wide">
      <div className="mb-4 space-y-2 sm:mb-6">
        <Skeleton className="h-8 w-32 sm:h-9" />
        <Skeleton className="hidden h-5 w-96 max-w-full sm:block" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex gap-4 overflow-hidden border-b border-border pb-3 pt-2">
          {["w-16", "w-14", "w-24", "w-14", "w-16", "w-16"].map((width, index) => <Skeleton key={index} className={`h-5 shrink-0 ${width}`} />)}
        </div>
        <div className="flex gap-2 overflow-hidden">
          {["w-32", "w-56", "w-56", "w-44"].map((width, index) => <Skeleton key={index} className={`h-11 shrink-0 rounded-full ${width}`} />)}
        </div>
      </div>
      <Skeleton className="mt-5 h-5 w-28" />
      <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <ActivityCardSkeleton key={index} />)}
      </div>
    </PageContainer>
  );
}

/** Khung xương trang chi tiết bài học: link quay lại, thẻ hero, thẻ đề bài + cột phụ. */
export function ActivityDetailSkeleton() {
  return (
    <PageContainer size="wide" className="space-y-3 sm:space-y-4">
      <Skeleton className="my-3 h-5 w-52" />
      <div className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 lg:p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-4/5" />
          <SkeletonText lines={2} />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-24" />
          </div>
        </div>
        <div className="space-y-3 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-13 w-full rounded-xl" />
          <Skeleton className="hidden h-14 w-full rounded-xl lg:block" />
        </div>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:p-8">
          <Skeleton className="h-6 w-48" />
          <SkeletonText lines={6} className="max-w-[65ch]" />
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </PageContainer>
  );
}
