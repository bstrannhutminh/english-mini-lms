import { Skeleton, SkeletonText } from "@/components/ui";
import { PageContainer } from "@/components/layout";

/** Khung xương trang Cài đặt — đúng bố cục thật: tiêu đề + các nhóm (đầu mục trái, thẻ phải). */
export function SettingsSkeleton() {
  return (
    <PageContainer size="wide" className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      {[3, 2, 1].map((cards, index) => (
        <div key={index} className="grid gap-4 border-t border-border pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full max-w-64" />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: cards }, (_, card) => (
              <div key={card} className="space-y-3 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <Skeleton className="h-5 w-44" />
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageContainer>
  );
}
