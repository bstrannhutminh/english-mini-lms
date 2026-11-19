import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { RouteErrorScreen } from "@/app/_shared/route-error-screen";
import { getLearnerOnboardingProfile } from "@/server/onboarding/service";
import { OnboardingView } from "@/features/onboarding/onboarding-view";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let learner;
  try {
    learner = await getCurrentLearner();
  } catch (error) {
    // Backend down — friendly retry instead of misrouting to login.
    console.error("OnboardingPage: getCurrentLearner failed:", error);
    return (
      <RouteErrorScreen
        title="Chưa tải được trang bắt đầu"
        message="Kết nối tới hệ thống đang gặp sự cố (cấu hình hoặc cơ sở dữ liệu). Vui lòng thử lại sau ít phút."
        retryHref="/onboarding"
      />
    );
  }

  if (!learner) {
    redirect("/login");
  }

  const profile = await getLearnerOnboardingProfile(learner.id).catch(
    () => null
  );

  return <OnboardingView initialProfile={profile} />;
}
