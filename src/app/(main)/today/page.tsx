import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { RouteErrorScreen } from "@/app/_shared/route-error-screen";
import {
  needsFirstRunOnboarding,
  resolveDefaultTargetMinutes,
} from "@/features/onboarding/onboarding-presets";
import TodayView from "@/features/today/today-view";
import { buildTodayGreeting } from "@/features/today/today-greeting";
import { getTodayRecommendation } from "@/server/today/service";
import {
  todayRecommendationSchema,
  type TodayRecommendationContract,
} from "@/contracts/today";

export const dynamic = "force-dynamic";

interface TodayPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  let learner;
  try {
    learner = await getCurrentLearner();
  } catch (error) {
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

  const params = searchParams ? await searchParams : {};
  const bypassOnboarding = params.skipOnboarding === "1";

  // Lần đầu vào app (chưa hoàn tất và chưa chọn bỏ qua) → dẫn vào Onboarding 4 bước
  if (!bypassOnboarding && needsFirstRunOnboarding(learner)) {
    redirect("/onboarding");
  }

  const initialTargetMinutes = resolveDefaultTargetMinutes(learner.preferences);

  // Render sẵn gợi ý hôm nay ở server → HTML đầu đã có bài học và nút bắt đầu.
  // Lỗi ở đây không chặn trang: client tự gọi /api/v1/today và hiện nút Thử lại.
  let initialData: TodayRecommendationContract | null = null;
  try {
    initialData = todayRecommendationSchema.parse(
      await getTodayRecommendation(learner.id, initialTargetMinutes)
    );
  } catch (error) {
    console.error("TodayPage: getTodayRecommendation failed:", error);
  }

  const { greeting, dateLabel } = buildTodayGreeting();

  return (
    <TodayView
      initialTargetMinutes={initialTargetMinutes}
      initialData={initialData}
      displayName={learner.displayName || "Bác sĩ Minh"}
      greeting={greeting}
      dateLabel={dateLabel}
    />
  );
}
