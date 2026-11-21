import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui";
import { SubmissionListSkeleton } from "@/features/my-work";

/** Khung xương /my-work: tiêu đề → hàng tab kỹ năng → chip trạng thái → lưới thẻ bài nộp. */
export default function MyWorkLoading() {
  return (
    <PageContainer className="space-y-5">
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-44 sm:h-9" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <div className="space-y-2">
        <div className="flex gap-4 overflow-hidden border-b border-border pb-3">
          {["w-20", "w-16", "w-24", "w-14", "w-16"].map((width, i) => (
            <Skeleton key={i} className={`h-6 shrink-0 ${width}`} />
          ))}
        </div>
        <div className="flex gap-2 overflow-hidden py-1">
          {["w-32", "w-28", "w-28"].map((width, i) => (
            <Skeleton key={i} className={`h-9 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
      </div>
      <Skeleton className="h-4 w-40" />
      <SubmissionListSkeleton />
    </PageContainer>
  );
}
