/**
 * Chấm bài nghe trắc nghiệm (deterministic, không cần AI) — phía EMIT.
 *
 * Chuyển nguyên logic inline của assessment.service.ts sang đây để format
 * observation do server phát ("Đáp án đúng là (B)…", "Câu q1: Bạn chọn (A)",
 * "Mốc 110s (câu q1)") nằm chung một nguồn với parser client ở
 * `listening-answer-checking.ts` — tránh lặp lại bug regex hai phía lệch nhau.
 * assessment.service.ts gọi `gradeListeningAnswers` trong nhánh
 * `activity.mode === "listening"`; client đọc lại bằng `buildListeningReview`.
 */
import {
  getCorrectOptionId,
  getTimestampReference,
} from "./listening-questions";

export interface ListeningGradeItem {
  id: string;
  prompt: unknown;
  userOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string | undefined;
  timestamp: number | undefined;
}

export interface ListeningGradeObservation {
  category: string;
  location: string;
  original: string;
  issue: string;
  suggestion: string;
  example: string;
  retry_prompt: string;
}

export interface ListeningGradeResult {
  correctCount: number;
  totalCount: number;
  /** Chỉ gồm các câu SAI (khớp hành vi hiện tại của assessment.service). */
  observations: ListeningGradeObservation[];
  strengths: string[];
  next_action: string;
  limitations: string;
  scores: Array<{
    kind: "practice_estimate";
    dimension: string;
    value: number;
    note: string;
  }>;
}

/** Chấm { questionId → optionId } theo đáp án trong nguồn câu hỏi. */
export function gradeListeningAnswers(
  questions: Array<Record<string, unknown>>,
  userAnswers: Record<string, string>,
): ListeningGradeResult {
  let correctCount = 0;
  const totalCount = questions.length;

  const details: ListeningGradeItem[] = questions.map((q) => {
    const qId = String(q.id ?? "");
    const userChoice = (userAnswers[qId] || "").trim().toUpperCase();
    const correctOpt = getCorrectOptionId(q);
    const isCorrect = correctOpt !== "" && userChoice === correctOpt;
    if (isCorrect) correctCount++;
    return {
      id: qId,
      prompt: q.prompt,
      userOption: userChoice,
      correctOption: correctOpt,
      isCorrect,
      explanation: q.explanation as string | undefined,
      timestamp: getTimestampReference(q),
    };
  });

  const scoreVal =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 10 * 10) / 10 : 0;

  const observations = details
    .filter((item) => !item.isCorrect)
    .map((item) => ({
      category: "comprehension",
      location: `Mốc ${item.timestamp || 0}s (câu ${item.id})`,
      original: `Câu ${item.id}: Bạn chọn (${item.userOption || "Chưa trả lời"})`,
      issue: `Đáp án đúng là (${item.correctOption}). ${item.explanation || "Chưa chính xác theo audio."}`,
      suggestion:
        `Xem lại đoạn audio tại mốc ${item.timestamp || 0}s. ${item.explanation || ""}`.trim(),
      example: `Đáp án đúng là (${item.correctOption})`,
      retry_prompt: `Nghe lại đoạn có thông tin câu ${item.id} và ghi chú từ khóa`,
    }));

  return {
    correctCount,
    totalCount,
    observations,
    strengths: [
      `Đã trả lời đúng ${correctCount}/${totalCount} câu hỏi nghe hiểu`,
    ],
    next_action:
      correctCount === totalCount
        ? "Xuất sắc! Bạn có thể chuyển sang luyện Shadowing các câu nói hay trong bài."
        : "Hãy nghe lại các đoạn có câu hỏi sai mà không nhìn transcript để tăng phản xạ.",
    limitations: "Điểm số phản ánh kết quả bài nghe trắc nghiệm cụ thể này.",
    scores: [
      {
        kind: "practice_estimate",
        dimension: "listening_comprehension",
        value: scoreVal,
        note: `Đúng ${correctCount}/${totalCount} câu`,
      },
    ],
  };
}
