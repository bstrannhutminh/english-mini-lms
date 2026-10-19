import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { RouteErrorScreen } from "@/app/_shared/route-error-screen";
import TodayView from "./today-view";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  let learner;
  try {
    learner = await getCurrentLearner();
  } catch (error) {
    // Missing env / DB down — show a friendly retry instead of crashing.
    console.error("TodayPage: getCurrentLearner failed:", error);
    return (
      <RouteErrorScreen
        title="Chưa tải được dữ liệu học tập"
        message="Kết nối tới hệ thống đang gặp sự cố (cấu hình hoặc cơ sở dữ liệu). Vui lòng thử lại sau ít phút."
        retryHref="/today"
      />
    );
  }

  if (!learner) {
    redirect("/login");
  }

  return (
    <TodayView
      initialTargetMinutes={30}
      userEmail={learner.displayName || "Bác sĩ Minh"}
      displayName={learner.displayName || "Bác sĩ Minh"}
    />
  );
}
