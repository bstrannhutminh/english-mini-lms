import { redirect } from "next/navigation";
import { getCurrentLearner } from "@/server/auth";
import { listLearnerSubmissions } from "@/server/learning/submission-list";
import {
  submissionListResponseSchema,
  type SubmissionListItem,
} from "@/contracts/submission";
import { WorkListView } from "@/features/my-work";

export const dynamic = "force-dynamic";

/**
 * Dữ liệu ban đầu cho danh sách — cùng service và cùng contract với
 * GET /api/v1/submissions (JSON hoá rồi parse bằng schema để kiểu luôn khớp).
 * Lỗi server → undefined: view tự rơi về đường fetch phía client, trang không sập.
 */
async function loadInitialSubmissions(
  learnerId: string
): Promise<SubmissionListItem[] | undefined> {
  try {
    const items = await listLearnerSubmissions(learnerId, null);
    const json: unknown = JSON.parse(JSON.stringify({ submissions: items }));
    const parsed = submissionListResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.error("MyWorkPage: submission list does not match contract:", parsed.error.message);
      return undefined;
    }
    return parsed.data.submissions;
  } catch (error) {
    console.error("MyWorkPage: listLearnerSubmissions failed:", error);
    return undefined;
  }
}

export default async function MyWorkPage() {
  const learner = await getCurrentLearner();
  if (!learner) {
    redirect("/login");
  }

  const initialData = await loadInitialSubmissions(learner.id);
  return <WorkListView initialData={initialData} />;
}
