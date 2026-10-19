/**
 * Đọc lại đáp án câu hỏi nghe phía client — MỘT parser chuẩn cho cả hai phía.
 *
 * Bối cảnh bug cũ (code-review-2026-09-26): client dùng regex riêng để đọc
 * đáp án đúng từ `observation.issue` do server phát ("Đáp án đúng là (B)").
 * Giờ format emit + parse nằm chung một nguồn:
 *  - `gradeListeningAnswers` (./listening-grading) → server phát observation.
 *  - `buildListeningReview` (file này)             → client đọc lại đáp án.
 * Không import DB/fs — an toàn cho cả client lẫn test hermetic.
 */
import type { ListeningQuestionOption } from "./listening-questions";

/* ── Format chuẩn của observation bài nghe (emit ⇄ parse) ── */

/** issue: "Đáp án đúng là (B). <giải thích>" → bắt chữ cái option trong ngoặc. */
export const CORRECT_OPTION_ISSUE_PATTERN =
  /Đáp án đúng là\s*\(\s*([A-Za-z])\s*\)/;

/** original: "Câu q1: Bạn chọn (A)" → bắt id câu hỏi sau "Câu ". */
export const OBSERVATION_QUESTION_PATTERN = /^Câu\s+(\S+)\s*:/;

/** location: "Mốc 110s (câu q1)" → bắt mốc giây nghe lại. */
export const LOCATION_TIMESTAMP_PATTERN = /(\d+)\s*s/;

/** Chữ cái đáp án đúng từ `issue` (trả null nếu không khớp — KHÔNG đoán bừa). */
export function parseCorrectOptionFromIssue(
  issue: string | null | undefined,
): string | null {
  const match = issue?.match(CORRECT_OPTION_ISSUE_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

/** Id câu hỏi từ `original` ("Câu q1: …" → "q1"); null khi không đúng format. */
export function parseQuestionIdFromOriginal(
  original: string | null | undefined,
): string | null {
  const match = original?.match(OBSERVATION_QUESTION_PATTERN);
  return match ? match[1] : null;
}

/** Mốc giây nghe lại từ `location` ("Mốc 110s …" → 110); null khi không có. */
export function parseTimestampFromLocation(
  location: string | null | undefined,
): number | null {
  const match = location?.match(LOCATION_TIMESTAMP_PATTERN);
  return match ? parseInt(match[1], 10) : null;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Tìm observation ứng với câu hỏi `questionId`.
 * Ưu tiên parse đúng format "Câu <id>:"; fallback đối sánh ranh giới từ —
 * tránh bug `includes("q1")` khớp nhầm cả "q10".
 */
export function findObservationForQuestion<
  T extends { original?: string | null },
>(observations: T[], questionId: string): T | undefined {
  return observations.find((obs) => {
    const parsed = parseQuestionIdFromOriginal(obs.original);
    if (parsed !== null) return parsed === questionId;
    if (!obs.original) return false;
    return new RegExp(`\\b${escapeRegExp(questionId)}\\b`).test(obs.original);
  });
}

/** Đọc `body` JSON của submission bài nghe → map { questionId: optionId }. */
export function parseListeningAnswersBody(
  body: string | null | undefined,
): Record<string, string> {
  if (!body) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object") return {};
  const raw =
    "answers" in parsed &&
    parsed.answers &&
    typeof parsed.answers === "object" &&
    !Array.isArray(parsed.answers)
      ? (parsed.answers as Record<string, unknown>)
      : (parsed as Record<string, unknown>);
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") answers[key] = value;
  }
  return answers;
}

/* ── Dựng lại đáp án & giải thích phía client sau khi nộp ── */

export const CORRECT_ANSWER_NOTE =
  "Bạn đã chọn đúng đáp án theo nội dung bài nghe.";

export interface ListeningReviewItem {
  id: string;
  prompt: string;
  userOption: string;
  /** null khi trả lời đúng hoặc khi format server không đọc được. */
  correctOption: string | null;
  isCorrect: boolean;
  explanation: string;
  /** Mốc giây gợi ý nghe lại; null → caller dùng startSeconds của đoạn. */
  timestamp: number | null;
}

/**
 * Dựng bảng đáp án sau nộp: observation chỉ tồn tại cho câu SAI;
 * câu không có observation = đã trả lời đúng.
 */
export function buildListeningReview(
  questions: Array<{ id: string; prompt: string }>,
  answers: Record<string, string>,
  observations: Array<{
    location?: string | null;
    original?: string | null;
    issue?: string | null;
    suggestion?: string | null;
  }> | null | undefined,
): ListeningReviewItem[] {
  const obsList = observations ?? [];
  return questions.map((q) => {
    const userChoice = answers[q.id] || "";
    const obs = findObservationForQuestion(obsList, q.id);

    if (!obs) {
      return {
        id: q.id,
        prompt: q.prompt,
        userOption: userChoice,
        correctOption: null,
        isCorrect: true,
        explanation: CORRECT_ANSWER_NOTE,
        timestamp: null,
      };
    }

    return {
      id: q.id,
      prompt: q.prompt,
      userOption: userChoice,
      correctOption: parseCorrectOptionFromIssue(obs.issue),
      isCorrect: false,
      explanation:
        obs.suggestion || obs.issue || "Nghe lại đoạn audio liên quan câu này.",
      timestamp: parseTimestampFromLocation(obs.location),
    };
  });
}

/** Trần các field đáp án khỏi payload gửi client (trước khi nộp). */
export function toClientQuestion(q: Record<string, unknown>): {
  id: string;
  prompt: string;
  options: ListeningQuestionOption[];
} {
  return {
    id: String(q.id ?? ""),
    prompt: String(q.prompt ?? ""),
    options: Array.isArray(q.options)
      ? (q.options as Array<{ id: string; text: string }>).map((opt) => ({
          id: opt.id,
          text: opt.text,
        }))
      : [],
  };
}
