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
  }
  catch (error) {
    // Backend down — friendly retry instead of misrouting to login.
    console.error("OnboardingPage: getCurrentLearner failed:", error);
    return (<RouteErrorScreen title="Chưa tải được trang bắt đầu" message="Kết nối tới hệ thống đang gặp sự cố (cấu hình hoặc cơ sở dữ liệu). Vui lòng thử lại sau ít phút." retryHref="/onboarding" />);
  }
  if (!learner) {
    redirect("/login");
  }
  let profile;
  try {
    profile = await getLearnerOnboardingProfile(learner.id);
  }
  catch (error) {
    console.error("OnboardingPage: profile load failed:", error);
    return <RouteErrorScreen title="Chưa tải được hồ sơ" message="Thiết lập đã lưu chưa tải được. Vui lòng thử lại để tiếp tục với đúng hồ sơ của bạn." retryHref="/onboarding" />;
  }
  return <OnboardingView initialProfile={profile} />;
}
