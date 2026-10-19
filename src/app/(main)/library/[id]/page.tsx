import { notFound } from "next/navigation";
import { getActivityDetail } from "@/server/library/detail";
import { uuidSchema } from "@/contracts/common";
import { PageContainer } from "@/components/layout";
import { ActivityDetail } from "@/features/library/activity-detail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ActivityDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const activity = await getActivityDetail(id);

  if (!activity) {
    notFound();
  }

  // ?revise=<submissionId> — từ dải "Gợi ý" khi luật đề xuất làm Bản 2.
  // Chỉ chuyển tiếp uuid hợp lệ (learn page truy vấn submissions bằng id này).
  const rawRevise = Array.isArray(query.revise)
    ? query.revise[0]
    : query.revise;
  const reviseParsed = uuidSchema.safeParse(rawRevise);

  return (
    <PageContainer size="default">
      <ActivityDetail
        activity={activity}
        reviseParentId={reviseParsed.success ? reviseParsed.data : undefined}
      />
    </PageContainer>
  );
}
