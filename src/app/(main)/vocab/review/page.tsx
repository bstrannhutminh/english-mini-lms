import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import { ReviewSession } from "@/features/vocab/review-session";
import { getDueVocabularyForReview } from "@/server/vocabulary/service";
import { reviewVocabItemSchema } from "@/contracts/vocabulary";

export const dynamic = "force-dynamic";

export default async function VocabReviewPage() {
  const learner = await getCurrentLearner();
  if (!learner) {
    redirect("/login");
  }

  // Render sẵn bộ từ đến hạn ở server (pattern /today) — HTML đầu đã có thẻ
  // ôn, client không fetch lại lúc mount. Lỗi → client tự fetch như cũ.
  let initialItems = null;
  try {
    const items = await getDueVocabularyForReview(learner.id, 5, false);
    initialItems = items.map((item) => reviewVocabItemSchema.parse(JSON.parse(JSON.stringify(item))));
  } catch (error) {
    console.error("VocabReviewPage: getDueVocabularyForReview failed:", error);
  }

  return <ReviewSession initialItems={initialItems} />;
}
