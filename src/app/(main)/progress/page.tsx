import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { RouteErrorScreen } from "@/app/_shared/route-error-screen";
import { getProgressSummary } from "@/server/progress/service";
import type { ProgressSummaryContract } from "@/contracts/progress";
import ProgressView from "@/features/progress/progress-view";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  let learner;
  try {
    learner = await getCurrentLearner();
  } catch (error) {
    console.error("ProgressPage: getCurrentLearner failed:", error);
    return (
      <RouteErrorScreen
        title="Chưa tải được tiến độ học tập"
        message="Kết nối tới hệ thống đang gặp sự cố (cấu hình hoặc cơ sở dữ liệu). Vui lòng thử lại sau ít phút."
        retryHref="/progress"
      />
    );
  }

  if (!learner) {
    redirect("/login");
  }

  let summary: ProgressSummaryContract;
  try {
    summary = await getProgressSummary(learner.id);
  } catch (error) {
    console.error("ProgressPage: getProgressSummary failed:", error);
    return (
      <RouteErrorScreen
        title="Chưa tải được tiến độ học tập"
        message="Không đọc được dữ liệu tiến độ. Vui lòng thử lại sau ít phút."
        retryHref="/progress"
      />
    );
  }

  return <ProgressView initialSummary={summary} />;
}
