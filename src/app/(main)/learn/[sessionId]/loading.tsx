import { Skeleton, SkeletonText } from "@/components/ui";

/**
 * Khung chờ của màn Học — đúng hình Learning Studio để không nháy bố cục:
 * thanh ứng dụng, công tắc Đề bài/Bài làm + một thẻ (mobile) hoặc hai cột
 * (desktop), thanh hành động dính đáy.
 */
export default function SegmentLoading() {
  return (
    <div className="min-h-dvh pb-24" role="status" aria-label="Đang mở phiên học">
      <div className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-3 px-3 sm:px-6 lg:h-16">
          <Skeleton className="h-9 w-9 rounded-xl sm:w-32" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 max-w-80" />
            <Skeleton className="h-3 w-1/2 max-w-48" />
          </div>
          <Skeleton className="h-11 w-24 rounded-full" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:pt-6">
        {/* Mobile: công tắc tab */}
        <div className="py-2 lg:hidden">
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </div>
        <Skeleton className="mb-4 mt-1 h-11 w-44 rounded-full lg:mb-5 lg:mt-0" />

        <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-6 w-2/3" />
            <Skeleton className="mt-5 h-16 w-full rounded-xl" />
            <SkeletonText lines={6} className="mt-6" />
          </div>
          <div className="hidden rounded-2xl border border-border bg-surface p-6 lg:block">
            <div className="flex items-end justify-between">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
            <Skeleton className="mt-5 h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-end gap-2 px-4 sm:gap-3 sm:px-6">
          <Skeleton className="h-11 w-28 rounded-xl sm:h-12" />
          <Skeleton className="h-11 flex-1 rounded-xl sm:h-12 sm:w-52 sm:flex-none" />
        </div>
      </div>
    </div>
  );
}
