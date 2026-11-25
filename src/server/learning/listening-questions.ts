import fs from "fs";
import path from "path";
import yaml from "yaml";
import { toClientQuestion } from "@/lib/listening-answer-checking";

type RawQuestion = Record<string, unknown>;

/**
 * Nguồn câu hỏi nghe cho một activity (dùng chung cho màn học và chấm điểm):
 *  1. `activities.questions` (DB, admin nhập) — mảng rỗng nghĩa là "không có câu hỏi".
 *  2. File yaml `questionsFile` khi cột DB là null.
 *
 * KHÔNG còn fallback mặc định sang `texts/l1-questions.yaml` — fallback đó từng
 * khiến bài không khai báo questions_file (ví dụ L3 shadowing) hiển thị nhầm
 * câu hỏi của bài L1. Bài thiếu câu hỏi giờ trả mảng rỗng và UI hiển thị
 * trạng thái thiếu rõ ràng thay vì chấm/hỏi sai nội dung.
 */
export function loadListeningQuestions(activity: {
  questions?: unknown;
  questionsFile?: string | null;
}): RawQuestion[] {
  if (Array.isArray(activity.questions)) {
    return activity.questions.filter(
      (q): q is RawQuestion => typeof q === "object" && q !== null
    );
  }

  // Không khai báo file câu hỏi → bài này không có câu hỏi trắc nghiệm
  // (ví dụ bài shadowing thuần). Trả rỗng là trạng thái hợp lệ.
  if (!activity.questionsFile) return [];

  const baseDir = path.resolve(process.cwd(), "content/english-lab");
  const qFile = path.resolve(baseDir, activity.questionsFile);
  if (!fs.existsSync(qFile)) {
    console.warn(`Listening questions file không tồn tại: ${activity.questionsFile}`);
    return [];
  }
  try {
    const parsed = yaml.parse(fs.readFileSync(qFile, "utf-8"));
    return Array.isArray(parsed?.questions) ? parsed.questions : [];
  } catch (err) {
    console.warn("Could not parse listening questions file:", err);
    return [];
  }
}

/**
 * Payload câu hỏi an toàn gửi client TRƯỚC khi nộp: bỏ correct_option_id,
 * explanation, timestamp_reference. Đây là nguồn chuẩn duy nhất —
 * loadListeningSessionData (màn /learn) dùng hàm này, không map tay.
 */
export function toClientQuestions(questions: RawQuestion[]): Array<{
  id: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
}> {
  return questions.map((q) => toClientQuestion(q));
}
