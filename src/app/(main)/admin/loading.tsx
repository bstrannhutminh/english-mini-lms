import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui";

/** Khung xương đúng bố cục AdminApp (cùng PageContainer wide) để không giật khi dữ liệu tới. */
export default function AdminLoading() {
  return (
    <PageContainer size="wide" className="space-y-6">
      <header className="space-y-2 border-b border-border pb-5">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-5 w-full max-w-md" />
      </header>
      <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </PageContainer>
  );
}
