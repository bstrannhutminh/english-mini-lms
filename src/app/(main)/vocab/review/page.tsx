import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { ReviewSession } from "@/features/vocab/review-session";

export const dynamic = "force-dynamic";

export default async function VocabReviewPage() {
  const learner = await getCurrentLearner();
  if (!learner) {
    redirect("/login");
  }

  return <ReviewSession />;
}
