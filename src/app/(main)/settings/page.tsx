import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { RouteErrorScreen } from "@/app/_shared/route-error-screen";
import { SettingsView } from "@/features/settings/settings-view";

export const metadata = {
  title: "Cài đặt — English Mini LMS",
};

export default async function SettingsPage() {
  let learner;
  try {
    learner = await getCurrentLearner();
  } catch (error) {
    // Backend down — friendly retry instead of misrouting to login.
    console.error("SettingsPage: getCurrentLearner failed:", error);
    return (
      <RouteErrorScreen
        title="Chưa tải được cài đặt"
        message="Kết nối tới hệ thống đang gặp sự cố (cấu hình hoặc cơ sở dữ liệu). Vui lòng thử lại sau ít phút."
        retryHref="/settings"
      />
    );
  }

  if (!learner) {
    redirect("/login");
  }

  return <SettingsView />;
}
