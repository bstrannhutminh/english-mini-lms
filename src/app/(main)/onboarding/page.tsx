import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { getLearnerOnboardingProfile } from "@/server/onboarding/service";
import { OnboardingView } from "@/features/onboarding/onboarding-view";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const learner = await getCurrentLearner().catch(() => null);
  if (!learner) {
    redirect("/login");
  }

  const profile = await getLearnerOnboardingProfile(learner.id).catch(
    () => null
  );

  return <OnboardingView initialProfile={profile} />;
}
