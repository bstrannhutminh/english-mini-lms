/**
 * Unit tests — mode Đọc–dịch plugin state logic (hermetic, no DOM/DB).
 * Invariants: payload JSON {mainIdea,translation,keyTerms} khớp server
 * evaluateReading; chỉ translation bắt buộc; draft rỗng → "" (autosave skip).
 */
import { describe, expect, it } from "vitest";
import type { SessionData } from "@/features/session/modes/types";
import {
  parseReadingPayload,
  initialReadingState,
  canSubmitReading,
  buildReadingSubmission,
  buildReadingDraft,
} from "@/features/session/modes/reading/state";

function makeData(overrides: Partial<SessionData> = {}): SessionData {
  return {
    sessionId: "sess-1",
    targetMinutes: 30,
    activity: {
      id: "act-1",
      slot: "R1",
      title: "Ultrasound-guided nerve block",
      mode: "reading",
      objective: null,
      promptText: null,
      feedbackGuide: null,
    },
    initialDraft: "",
    ...overrides,
  };
}

describe("parseReadingPayload", () => {
  it("parses JSON draft payload", () => {
    const raw = JSON.stringify({
      mainIdea: "Idea",
      translation: "Bản dịch",
      keyTerms: "term1",
    });
    expect(parseReadingPayload(raw)).toEqual({
      mainIdea: "Idea",
      translation: "Bản dịch",
      keyTerms: "term1",
    });
  });

  it("treats plain text as translation", () => {
    expect(parseReadingPayload("một bản dịch thường")).toEqual({
      mainIdea: "",
      translation: "một bản dịch thường",
      keyTerms: "",
    });
  });

  it("returns empty fields for null/empty input", () => {
    expect(parseReadingPayload(null)).toEqual({
      mainIdea: "",
      translation: "",
      keyTerms: "",
    });
    expect(parseReadingPayload("")).toEqual({
      mainIdea: "",
      translation: "",
      keyTerms: "",
    });
  });

  it("ignores non-string JSON fields", () => {
    const raw = JSON.stringify({ translation: 42, mainIdea: "ok" });
    expect(parseReadingPayload(raw).translation).toBe("");
    expect(parseReadingPayload(raw).mainIdea).toBe("ok");
  });
});

describe("initialReadingState", () => {
  it("prefills from JSON draft", () => {
    const data = makeData({
      initialDraft: JSON.stringify({ mainIdea: "M", translation: "T", keyTerms: "K" }),
    });
    const s = initialReadingState(data);
    expect(s).toMatchObject({ mainIdea: "M", translation: "T", keyTerms: "K" });
  });

  it("falls back to parent submission body when no draft (revision)", () => {
    const data = makeData({
      parentData: {
        submission: {
          id: "sub-1",
          revision: 1,
          body: JSON.stringify({ translation: "bản dịch cũ" }),
          assisted: false,
          submittedAt: new Date(),
        },
        feedback: null,
      },
    });
    const s = initialReadingState(data);
    expect(s.translation).toBe("bản dịch cũ");
    expect(s.showParentRef).toBe(true);
  });
});

describe("canSubmitReading", () => {
  it("requires translation only (old view semantics)", () => {
    expect(canSubmitReading({ mainIdea: "", translation: "", keyTerms: "", showParentRef: false }).ok).toBe(false);
    expect(
      canSubmitReading({ mainIdea: "", translation: "  dịch  ", keyTerms: "", showParentRef: false }).ok,
    ).toBe(true);
  });

  it("returns Vietnamese reason when blocked", () => {
    const check = canSubmitReading({ mainIdea: "", translation: " ", keyTerms: "", showParentRef: false });
    expect(check.ok).toBe(false);
    expect(check.reason).toContain("bản dịch");
  });
});

describe("buildReadingSubmission / buildReadingDraft", () => {
  const state = { mainIdea: "  idea ", translation: " dịch ", keyTerms: " k ", showParentRef: false };

  it("serializes trimmed JSON payload as submission body", () => {
    const input = buildReadingSubmission(state);
    expect(JSON.parse(input.body as string)).toEqual({
      mainIdea: "idea",
      translation: "dịch",
      keyTerms: "k",
    });
    // append-only: client never sends assisted/parentId (shell adds parentId)
    expect(input).not.toHaveProperty("assisted");
  });

  it("returns empty draft when all fields blank (autosave skips)", () => {
    expect(
      buildReadingDraft({ mainIdea: " ", translation: "", keyTerms: "  ", showParentRef: false }),
    ).toBe("");
  });

  it("serializes draft with same payload format", () => {
    expect(JSON.parse(buildReadingDraft(state))).toEqual({
      mainIdea: "idea",
      translation: "dịch",
      keyTerms: "k",
    });
  });
});
