import { redirect } from "next/navigation";
import { getCurrentLearner } from "@/server/auth";
import { FlashcardDeck } from "@/features/vocab/flashcard-deck";
import { getVocabularyForFlashcards } from "@/server/vocabulary/service";
import { reviewVocabItemSchema, type ReviewVocabItem } from "@/contracts/vocabulary";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flashcard Ôn nhanh | English Mini LMS",
  description: "Ôn tập từ vựng nhanh 60 giây bằng thẻ vuốt Spaced Repetition",
};

export default async function FlashcardsPage() {
  const learner = await getCurrentLearner();
  if (!learner) {
    redirect("/login");
  }

  // Render sẵn bộ thẻ "due" (limit 20 — khớp default client) ở server
  // (pattern /today): khi không có snapshot resume trong sessionStorage,
  // client dùng luôn deck này, khỏi fetch trùng một roundtrip. Nhánh resume
  // vẫn fetch client vì sessionStorage chỉ tồn tại ở trình duyệt.
  // Lỗi → client tự fetch như cũ.
  let initialDeck: ReviewVocabItem[] | null = null;
  try {
    const items = await getVocabularyForFlashcards(learner.id, 20, "due");
    initialDeck = items.map((item) =>
      reviewVocabItemSchema.parse(JSON.parse(JSON.stringify(item)))
    );
  } catch (error) {
    console.error("FlashcardsPage: getVocabularyForFlashcards failed:", error);
  }

  return <FlashcardDeck initialDeck={initialDeck} />;
}
