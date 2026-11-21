import { Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout";

/** Khung xương trang Sổ từ: tiêu đề + 3 số liệu, thẻ ôn hôm nay, thanh lọc và lưới thẻ từ. */
export function VocabSkeleton() {
  return (
    <PageContainer className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24 sm:h-9" />
          <Skeleton className="hidden h-5 w-80 sm:block" />
        </div>
        <Skeleton className="h-18 w-full rounded-2xl lg:w-96" />
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-18 w-18 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-44" />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:flex">
          <Skeleton className="h-13 w-full rounded-xl lg:w-40" />
          <Skeleton className="h-11 w-full rounded-xl sm:h-13 lg:w-48" />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-12 w-full rounded-xl lg:flex-1" />
        <Skeleton className="h-13 w-full rounded-xl lg:w-80" />
      </div>
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <Skeleton className="h-6 w-48 max-w-full" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-56 max-w-full" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

/** Khung xương cho hai màn ôn (thẻ lật / viết câu): thanh trên, thẻ lớn, hai nút. */
export function VocabPracticeSkeleton() {
  return (
    <PageContainer size="narrow" className="space-y-4">
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-80 w-full rounded-2xl sm:h-96" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    </PageContainer>
  );
}
