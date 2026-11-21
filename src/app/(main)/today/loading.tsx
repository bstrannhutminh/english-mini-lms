import { PageContainer } from "@/components/layout";
import { TodaySkeleton } from "@/features/today/today-skeleton";

/** Khung chờ đúng hình trang Hôm nay — hiện ngay khi điều hướng. */
export default function TodayLoading() {
  return (
    <PageContainer>
      <TodaySkeleton />
    </PageContainer>
  );
}
