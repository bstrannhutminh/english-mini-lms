import { Skeleton } from "@/components/ui";

export default function AdminLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="border-b pb-4 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-11 w-72" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
