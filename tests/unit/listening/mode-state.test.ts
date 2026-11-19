import { describe, expect, it } from "vitest";
import {
  buildDraft,
  buildSubmission,
  canSubmit,
  initialState,
} from "@/features/session/modes/listening/state";
import type { SessionData } from "@/features/session/modes/types";

function makeSessionData(overrides: Partial<SessionData> = {}): SessionData {
  return {
    sessionId: "sess-1",
    targetMinutes: 30,
    activity: {
      id: "l1",
      slot: "L1",
      title: "Bài nghe 1",
      mode: "listening",
      objective: null,
      promptText: null,
      feedbackGuide: null,
    },
    initialDraft: "",
    listening: {
      videoUrl: "https://www.youtube.com/watch?v=abc",
      startSeconds: 95,
      endSeconds: 155,
      questions: [
        { id: "q1", prompt: "Câu 1?", options: [{ id: "A", text: "a" }] },
        { id: "q2", prompt: "Câu 2?", options: [{ id: "A", text: "a" }] },
      ],
      transcriptSegments: [],
      isTranscriptRevealed: false,
    },
    ...overrides,
  };
}

describe("initialState", () => {
  it("đọc nháp đáp án dạng { answers } — vòng khôi phục buildDraft", () => {
    const data = makeSessionData({
      initialDraft: JSON.stringify({ answers: { q1: "B" } }),
    });
    const state = initialState(data);
    expect(state.answers).toEqual({ q1: "B" });
    expect(state.questionIds).toEqual(["q1", "q2"]);
    expect(state.revealed).toBe(false);
    expect(state.submittedId).toBeNull();
  });

  it("nháp rác (text thường) → answers rỗng, không throw", () => {
    const state = initialState(makeSessionData({ initialDraft: "hello" }));
    expect(state.answers).toEqual({});
  });

  it("data.listening null → questionIds rỗng nhưng không crash", () => {
    const state = initialState(makeSessionData({ listening: null }));
    expect(state.questionIds).toEqual([]);
  });
});

describe("canSubmit", () => {
  it("chặn khi chưa chọn đủ đáp án", () => {
    const state = { ...initialState(makeSessionData()), answers: { q1: "A" } };
    const check = canSubmit(state);
    expect(check.ok).toBe(false);
    expect(check.reason).toContain("1/2");
  });

  it("cho nộp khi đủ đáp án", () => {
    const state = {
      ...initialState(makeSessionData()),
      answers: { q1: "A", q2: "B" },
    };
    expect(canSubmit(state).ok).toBe(true);
  });

  it("chặn khi không có câu hỏi nào", () => {
    const state = initialState(makeSessionData({ listening: null }));
    expect(canSubmit(state).ok).toBe(false);
  });

  it("chặn nộp lại sau khi đã nộp (submittedId)", () => {
    const state = {
      ...initialState(makeSessionData()),
      answers: { q1: "A", q2: "B" },
      submittedId: "sub-1",
    };
    expect(canSubmit(state).ok).toBe(false);
  });
});

describe("buildSubmission / buildDraft", () => {
  it("body là JSON { answers } khớp parser phía server", () => {
    const state = {
      ...initialState(makeSessionData()),
      answers: { q1: "B" },
    };
    expect(JSON.parse(buildSubmission(state).body)).toEqual({
      answers: { q1: "B" },
    });
  });

  it("buildDraft rỗng khi chưa chọn gì; JSON khi đã chọn", () => {
    const empty = initialState(makeSessionData());
    expect(buildDraft(empty)).toBe("");
    const answered = { ...empty, answers: { q2: "C" } };
    expect(JSON.parse(buildDraft(answered))).toEqual({ answers: { q2: "C" } });
  });
});
