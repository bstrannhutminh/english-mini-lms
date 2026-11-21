import { PageContainer } from "@/components/layout";
import { Skeleton, SkeletonText } from "@/components/ui";

/** Khung xương trang góp ý: điều hướng → thẻ tóm tắt (vòng điểm, việc tiếp theo, CTA) → điểm → thẻ góp ý. */
export default function SubmissionDetailLoading() {
  return (
    <PageContainer className="space-y-6">
      <div className="space-y-2">
        <div className="flex min-h-11 items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-4/5" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-7 w-32" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:gap-2">
              <Skeleton className="h-[92px] w-[92px] shrink-0 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>
          <Skeleton className="mt-5 h-20 w-full rounded-xl" />
          <Skeleton className="mt-5 h-12 w-48 rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <Skeleton className="h-6 w-56" />
        <div className="mt-5 space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="h-5 w-2/3 max-w-xs" />
              <Skeleton className="h-1.5 w-full max-w-xs rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-7 w-52" />
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <SkeletonText lines={2} className="mt-4" />
        </div>
      ))}
    </PageContainer>
  );
}
