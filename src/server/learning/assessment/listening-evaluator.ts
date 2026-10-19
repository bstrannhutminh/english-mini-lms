/**
 * Chấm Listening local (không gọi Gemini): đối chiếu `answers` của learner
 * với `correct_option_id` từng câu hỏi rồi dựng feedback đúng chuẩn
 * WritingFeedback (observations đủ 6 field + limitations + scores
 * kind="practice_estimate"). Hàm thuần — không đụng DB/fs → unit-test được.
 */
import type { WritingFeedback } from "@/server/providers/gemini/types";
import {
  getCorrectOptionId,
  getTimestampReference,
} from "@/lib/listening-questions";

type RawQuestion = Record<string, unknown>;

export interface LocalEvaluationResult {
  feedback: WritingFeedback;
  tokenInput: number;
  tokenOutput: number;
  modelName: string;
}

/**
 * Đọc body của bài nộp listening. Client gửi JSON `{"answers": {"q1":"A"}}`;
 * chấp nhận cả object phẳng `{"q1":"A"}` cho tương thích ngược.
 * Body rỗng/không parse được → coi như chưa trả lời câu nào.
 */
export function parseListeningAnswers(body: string | null): Record<string, string> {
  if (!body) return {};
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const record = parsed as Record<string, unknown>;
      const answers = record.answers;
      const source =
        answers && typeof answers === "object" && !Array.isArray(answers)
          ? (answers as Record<string, unknown>)
          : record;
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === "string") normalized[key] = value;
      }
      return normalized;
    }
  } catch {
    // body không phải JSON — giữ hành vi cũ: không crash, chấm như chưa trả lời
  }
  return {};
}

/** Chấm toàn bộ câu hỏi của một activity listening/ielts-listening. */
export function gradeListeningSubmission(
  questions: RawQuestion[],
  body: string | null
): LocalEvaluationResult {
  const userAnswers = parseListeningAnswers(body);

  let correctCount = 0;
  const totalCount = questions.length;
  const detailedFeedback = questions.map((q) => {
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

  const feedback: WritingFeedback = {
    observations: detailedFeedback
      .filter((item) => !item.isCorrect)
      .map((item) => ({
        category: "comprehension",
        location: `Mốc ${item.timestamp || 0}s (câu ${item.id})`,
        original: `Câu ${item.id}: Bạn chọn (${item.userOption || "Chưa trả lời"})`,
        issue: `Đáp án đúng là (${item.correctOption}). ${item.explanation || "Chưa chính xác theo audio."}`,
        suggestion: `Xem lại đoạn audio tại mốc ${item.timestamp || 0}s. ${item.explanation || ""}`.trim(),
        example: `Đáp án đúng là (${item.correctOption})`,
        retry_prompt: `Nghe lại đoạn có thông tin câu ${item.id} và ghi chú từ khóa`,
      })),
    strengths: [`Đã trả lời đúng ${correctCount}/${totalCount} câu hỏi nghe hiểu`],
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

  return {
    feedback,
    tokenInput: 0,
    tokenOutput: 0,
    modelName: "local-evaluator",
  };
}
