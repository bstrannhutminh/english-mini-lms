import { describe, expect, it } from "vitest";
import { gradeListeningSubmission } from "@/server/learning/assessment/listening-evaluator";
import {
  buildListeningReview,
  findObservationForQuestion,
  parseCorrectOptionFromIssue,
  parseListeningAnswersBody,
  parseQuestionIdFromOriginal,
  parseTimestampFromLocation,
  toClientQuestion,
} from "@/lib/listening-answer-checking";

const QUESTIONS = [
  {
    id: "q1",
    prompt: "Câu hỏi 1?",
    options: [
      { id: "A", text: "Đáp A" },
      { id: "B", text: "Đáp B" },
    ],
    correct_option_id: "B",
    explanation: "Giải thích q1",
    timestamp_reference: 110,
  },
  {
    id: "q2",
    prompt: "Câu hỏi 2?",
    options: [
      { id: "A", text: "Đáp A" },
      { id: "B", text: "Đáp B" },
    ],
    correct_option_id: "A",
    explanation: "Giải thích q2",
    timestamp_reference: 55,
  },
  // Id tiền tố trùng — regression test cho bug includes("q1") khớp "q10"
  {
    id: "q10",
    prompt: "Câu hỏi 10?",
    options: [
      { id: "A", text: "Đáp A" },
      { id: "B", text: "Đáp B" },
    ],
    correct_option_id: "B",
    explanation: "Giải thích q10",
    timestamp_reference: 300,
  },
];

describe("parseCorrectOptionFromIssue", () => {
  it("bắt đáp án đúng từ format server phát", () => {
    expect(
      parseCorrectOptionFromIssue("Đáp án đúng là (B). Giải thích..."),
    ).toBe("B");
  });

  it("chịu khoảng trắng & chữ thường trong ngoặc", () => {
    expect(parseCorrectOptionFromIssue("Đáp án đúng là  ( b )")).toBe("B");
  });

  it("trả null khi không đúng format — không đoán bừa", () => {
    expect(parseCorrectOptionFromIssue("Đáp án đúng là B")).toBeNull();
    expect(parseCorrectOptionFromIssue("some english text")).toBeNull();
    expect(parseCorrectOptionFromIssue(null)).toBeNull();
    expect(parseCorrectOptionFromIssue(undefined)).toBeNull();
  });
});

describe("parseQuestionIdFromOriginal", () => {
  it("bắt id sau 'Câu ' đến dấu hai chấm", () => {
    expect(parseQuestionIdFromOriginal("Câu q1: Bạn chọn (A)")).toBe("q1");
    expect(parseQuestionIdFromOriginal("Câu q10: Bạn chọn (B)")).toBe("q10");
  });

  it("trả null khi format lạ", () => {
    expect(parseQuestionIdFromOriginal("Bạn chọn (A)")).toBeNull();
    expect(parseQuestionIdFromOriginal(null)).toBeNull();
  });
});

describe("parseTimestampFromLocation", () => {
  it("bắt mốc giây từ 'Mốc 110s (câu q1)'", () => {
    expect(parseTimestampFromLocation("Mốc 110s (câu q1)")).toBe(110);
    expect(parseTimestampFromLocation("Mốc 0s (câu q2)")).toBe(0);
  });

  it("trả null khi không có mốc", () => {
    expect(parseTimestampFromLocation("Câu hỏi 3")).toBeNull();
    expect(parseTimestampFromLocation(null)).toBeNull();
  });
});

describe("findObservationForQuestion", () => {
  const observations = [
    {
      original: "Câu q10: Bạn chọn (A)",
      location: "Mốc 300s (câu q10)",
      issue: "Đáp án đúng là (B).",
    },
  ];

  it("khớp đúng id — không nhầm q1 với q10 (bug cũ: includes)", () => {
    expect(findObservationForQuestion(observations, "q1")).toBeUndefined();
    expect(findObservationForQuestion(observations, "q10")).toBe(
      observations[0],
    );
  });
});

describe("gradeListeningSubmission → buildListeningReview (round-trip)", () => {
  it("emit đúng format mà parser client đọc lại được", () => {
    const answers = { q1: "B", q2: "B", q10: "A" }; // q1 đúng, q2+q10 sai
    const { feedback } = gradeListeningSubmission(
      QUESTIONS,
      JSON.stringify({ answers }),
    );

    // invariant: chỉ câu sai có observation
    expect(feedback.observations).toHaveLength(2);
    // invariant: điểm chỉ ở kind practice_estimate
    expect(feedback.scores[0].kind).toBe("practice_estimate");
    expect(feedback.scores[0].value).toBeCloseTo(3.3, 1);

    const review = buildListeningReview(
      QUESTIONS,
      answers,
      feedback.observations,
    );
    expect(review).toHaveLength(3);

    const [r1, r2, r10] = review;
    expect(r1.isCorrect).toBe(true);
    expect(r1.correctOption).toBeNull();

    expect(r2.isCorrect).toBe(false);
    expect(r2.userOption).toBe("B");
    expect(r2.correctOption).toBe("A");
    expect(r2.timestamp).toBe(55);

    expect(r10.isCorrect).toBe(false);
    expect(r10.correctOption).toBe("B");
    expect(r10.timestamp).toBe(300);
  });

  it("câu chưa trả lời được tính sai và ghi 'Chưa trả lời'", () => {
    const answers = { q1: "B" };
    const { feedback } = gradeListeningSubmission(
      QUESTIONS,
      JSON.stringify({ answers }),
    );
    const review = buildListeningReview(QUESTIONS, answers, feedback.observations);
    expect(feedback.observations).toHaveLength(2);
    expect(review[1].isCorrect).toBe(false);
    expect(review[2].isCorrect).toBe(false);
  });

  it("không có câu hỏi → điểm 0, không observation", () => {
    const { feedback } = gradeListeningSubmission([], "{}");
    expect(feedback.observations).toHaveLength(0);
    expect(feedback.scores[0].value).toBe(0);
  });
});

describe("buildListeningReview", () => {
  it("observations null → mọi câu đúng (hiển thị 'Chưa trả lời' khi thiếu)", () => {
    const review = buildListeningReview(QUESTIONS.slice(0, 1), {}, null);
    expect(review[0].isCorrect).toBe(true);
    expect(review[0].userOption).toBe("");
  });
});

describe("parseListeningAnswersBody", () => {
  it("đọc { answers: {...} }", () => {
    expect(
      parseListeningAnswersBody(JSON.stringify({ answers: { q1: "B", q2: "a" } })),
    ).toEqual({ q1: "B", q2: "a" });
  });

  it("đọc object phẳng (format cũ)", () => {
    expect(parseListeningAnswersBody('{"q1":"B"}')).toEqual({ q1: "B" });
  });

  it("trả {} khi body rác/rỗng — không throw", () => {
    expect(parseListeningAnswersBody("bài viết bình thường")).toEqual({});
    expect(parseListeningAnswersBody("")).toEqual({});
    expect(parseListeningAnswersBody(null)).toEqual({});
    expect(parseListeningAnswersBody(undefined)).toEqual({});
  });
});

describe("toClientQuestion", () => {
  it("trần đáp án/giải thích/mốc giây khỏi payload client", () => {
    const client = toClientQuestion(QUESTIONS[0]);
    expect(client).toEqual({
      id: "q1",
      prompt: "Câu hỏi 1?",
      options: [
        { id: "A", text: "Đáp A" },
        { id: "B", text: "Đáp B" },
      ],
    });
    expect("correct_option_id" in client).toBe(false);
    expect("explanation" in client).toBe(false);
    expect("timestamp_reference" in client).toBe(false);
  });
});
