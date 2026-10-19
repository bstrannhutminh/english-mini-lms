import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { SettingsView } from "@/features/settings/settings-view";

export const metadata = {
  title: "Cài đặt — English Mini LMS",
};

export default async function SettingsPage() {
  const learner = await getCurrentLearner().catch(() => null);
  if (!learner) {
    redirect("/login");
  }

  return <SettingsView />;
}
