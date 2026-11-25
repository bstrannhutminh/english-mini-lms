import { describe, it, expect } from "vitest";
import {
  loadListeningQuestions,
  toClientQuestions,
} from "@/server/learning/listening-questions";

/**
 * loadListeningQuestions đọc file yaml trong content/english-lab (cwd = repo
 * root khi chạy vitest) — hermetic vì không cần env/DB, file content nằm
 * trong repo. Trọng tâm: KHÔNG còn fallback ngầm sang câu hỏi của bài L1
 * cho các activity không khai báo questions_file (lỗi L3 shadowing hiện
 * nhầm câu hỏi L1).
 */
describe("loadListeningQuestions", () => {
  it("questions trong DB (admin nhập) được ưu tiên tuyệt đối", () => {
    const dbQuestions = [{ id: "q-db", prompt: "Câu hỏi từ DB" }];
    const result = loadListeningQuestions({
      questions: dbQuestions,
      questionsFile: "texts/l1-questions.yaml",
    });
    expect(result).toEqual(dbQuestions);
  });

  it("questions là mảng rỗng trong DB nghĩa là không có câu hỏi — không đọc file", () => {
    const result = loadListeningQuestions({
      questions: [],
      questionsFile: "texts/l1-questions.yaml",
    });
    expect(result).toEqual([]);
  });

  it("KHÔNG fallback sang l1-questions.yaml khi activity không khai báo questionsFile", () => {
    // Đây là regression test của lỗi L3: bài shadowing không có questions_file
    // nhưng vẫn hiện câu hỏi của L1 vì fallback ngầm.
    expect(loadListeningQuestions({ questions: null, questionsFile: null })).toEqual([]);
    expect(loadListeningQuestions({})).toEqual([]);
    expect(loadListeningQuestions({ questionsFile: undefined })).toEqual([]);
  });

  it("đọc đúng file yaml khi questionsFile được khai báo", () => {
    const result = loadListeningQuestions({
      questions: null,
      questionsFile: "texts/l1-questions.yaml",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id", "q1");
    expect(result[0]).toHaveProperty("correct_option_id");
  });

  it("file không tồn tại → trả rỗng (trạng thái thiếu rõ ràng, không ném lỗi)", () => {
    expect(
      loadListeningQuestions({ questions: null, questionsFile: "texts/khong-ton-tai.yaml" })
    ).toEqual([]);
  });

  it("lọc bỏ phần tử không phải object trong mảng questions DB", () => {
    const result = loadListeningQuestions({
      questions: [{ id: "q1" }, null, "rác", 42],
      questionsFile: null,
    });
    expect(result).toEqual([{ id: "q1" }]);
  });
});

describe("toClientQuestions", () => {
  it("trần correct_option_id/explanation/timestamp_reference khỏi payload client", () => {
    const raw = loadListeningQuestions({
      questions: null,
      questionsFile: "texts/l1-questions.yaml",
    });
    const clientQuestions = toClientQuestions(raw);
    expect(clientQuestions.length).toBeGreaterThan(0);
    for (const q of clientQuestions) {
      expect(q).not.toHaveProperty("correct_option_id");
      expect(q).not.toHaveProperty("explanation");
      expect(q).not.toHaveProperty("timestamp_reference");
      expect(typeof q.id).toBe("string");
      expect(typeof q.prompt).toBe("string");
      expect(Array.isArray(q.options)).toBe(true);
    }
  });

  it("chịu được câu hỏi thiếu options/id — không ném lỗi", () => {
    const clientQuestions = toClientQuestions([{ prompt: "Thiếu id và options" }]);
    expect(clientQuestions).toEqual([{ id: "", prompt: "Thiếu id và options", options: [] }]);
  });
});
