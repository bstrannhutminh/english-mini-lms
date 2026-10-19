import { describe, it, expect } from "vitest";
import {
  gradeListeningSubmission,
  parseListeningAnswers,
} from "@/server/learning/assessment/listening-evaluator";

const QUESTIONS = [
  {
    id: "q1",
    prompt: "What does the speaker say about dosage?",
    options: [
      { id: "A", text: "5mg" },
      { id: "B", text: "10mg" },
    ],
    correct_option_id: "B",
    explanation: "Liều 10mg được nhắc ở phút 2.",
    timestamp_reference: 120,
  },
  {
    id: "q2",
    prompt: "Where is the conference held?",
    options: [
      { id: "A", text: "Hanoi" },
      { id: "B", text: "Danang" },
    ],
    correct_option_id: "A",
  },
];

describe("parseListeningAnswers", () => {
  it("đọc dạng { answers: { q1: 'A' } }", () => {
    expect(parseListeningAnswers(JSON.stringify({ answers: { q1: "A" } }))).toEqual({ q1: "A" });
  });

  it("đọc dạng flat { q1: 'A' } (legacy)", () => {
    expect(parseListeningAnswers(JSON.stringify({ q1: "a" }))).toEqual({ q1: "a" });
  });

  it("body rỗng / JSON hỏng / non-string values → không crash, trả {}", () => {
    expect(parseListeningAnswers(null)).toEqual({});
    expect(parseListeningAnswers("not-json{")).toEqual({});
    expect(parseListeningAnswers(JSON.stringify({ q1: 5 }))).toEqual({});
    expect(parseListeningAnswers(JSON.stringify(["a"]))).toEqual({});
  });
});

describe("gradeListeningSubmission — bất biến feedback", () => {
  it("đúng hết → score 10, không observation, next_action gợi ý shadowing", () => {
    const { feedback, modelName, tokenInput, tokenOutput } = gradeListeningSubmission(
      QUESTIONS,
      JSON.stringify({ answers: { q1: "B", q2: "A" } })
    );
    expect(modelName).toBe("local-evaluator");
    expect(tokenInput).toBe(0);
    expect(tokenOutput).toBe(0);
    expect(feedback.observations).toHaveLength(0);
    expect(feedback.scores[0].kind).toBe("practice_estimate");
    expect(feedback.scores[0].value).toBe(10);
    expect(feedback.next_action).toContain("Shadowing");
    expect(feedback.limitations.length).toBeGreaterThan(0);
  });

  it("sai 1/2 → observation chỉ cho câu sai, đủ 6 trường bắt buộc", () => {
    const { feedback } = gradeListeningSubmission(
      QUESTIONS,
      JSON.stringify({ answers: { q1: "A", q2: "A" } })
    );
    expect(feedback.observations).toHaveLength(1);
    const obs = feedback.observations[0];
    for (const key of ["location", "original", "issue", "suggestion", "example", "retry_prompt"]) {
      expect(obs, `obs.${key}`).toHaveProperty(key);
      expect(typeof (obs as Record<string, unknown>)[key]).toBe("string");
      expect(((obs as Record<string, unknown>)[key] as string).length).toBeGreaterThan(0);
    }
    expect(obs.issue).toContain("B");
    expect(feedback.scores[0].value).toBe(5);
    // KHÔNG có trường kiểu "official IELTS band"
    expect(JSON.stringify(feedback.scores)).not.toMatch(/official|band/i);
  });

  it("không trả lời câu nào → mọi câu đều là observation, score 0", () => {
    const { feedback } = gradeListeningSubmission(QUESTIONS, null);
    expect(feedback.observations).toHaveLength(2);
    expect(feedback.scores[0].value).toBe(0);
    expect(feedback.observations[0].original).toContain("Chưa trả lời");
  });

  it("không có câu hỏi → score 0, feedback vẫn hợp lệ", () => {
    const { feedback } = gradeListeningSubmission([], "{}");
    expect(feedback.scores[0].value).toBe(0);
    expect(feedback.observations).toHaveLength(0);
  });
});
