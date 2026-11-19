/**
 * Unit tests — mode Nói plugin state logic (hermetic, no DOM/DB).
 * Invariants: audio thật → submission kèm mediaId; text-only → chỉ body
 * (server ghi pronunciation not_assessable); client KHÔNG gửi `assisted`;
 * chặn nộp khi đang ghi / đang upload / upload lỗi.
 */
import { describe, expect, it } from "vitest";
import type { SessionData } from "@/features/session/modes/types";
import {
  initialSpeakingState,
  canSubmitSpeaking,
  buildSpeakingSubmission,
  buildSpeakingDraft,
  type SpeakingModeState,
} from "@/features/session/modes/speaking/state";

function makeData(overrides: Partial<SessionData> = {}): SessionData {
  return {
    sessionId: "sess-1",
    targetMinutes: 30,
    activity: {
      id: "act-1",
      slot: "S1",
      title: "Conference small talk",
      mode: "speaking",
      objective: null,
      promptText: null,
      feedbackGuide: null,
    },
    initialDraft: "",
    ...overrides,
  };
}

function makeState(overrides: Partial<SpeakingModeState> = {}): SpeakingModeState {
  return {
    notes: "",
    mediaId: null,
    mediaStatus: "idle",
    mediaError: null,
    durationSeconds: 0,
    isRecording: false,
    showParentRef: false,
    ...overrides,
  };
}

describe("initialSpeakingState", () => {
  it("starts clean with notes from draft", () => {
    const s = initialSpeakingState(makeData({ initialDraft: "ghi chú nháp" }));
    expect(s).toMatchObject({ notes: "ghi chú nháp", mediaStatus: "idle", mediaId: null });
  });

  it("prefills notes from parent body on revision", () => {
    const s = initialSpeakingState(
      makeData({
        parentData: {
          submission: {
            id: "sub-1",
            revision: 1,
            body: "ý chính bản trước",
            assisted: true,
            submittedAt: new Date(),
            audioUrl: "https://signed-url",
          },
          feedback: null,
        },
      }),
    );
    expect(s.notes).toBe("ý chính bản trước");
    expect(s.showParentRef).toBe(true);
  });
});

describe("canSubmitSpeaking", () => {
  it("blocks empty state", () => {
    const check = canSubmitSpeaking(makeState());
    expect(check.ok).toBe(false);
    expect(check.reason).toBeTruthy();
  });

  it("blocks while recording (prevents losing the take)", () => {
    expect(canSubmitSpeaking(makeState({ isRecording: true, notes: "x" })).ok).toBe(false);
  });

  it("blocks while uploading and on upload error", () => {
    expect(canSubmitSpeaking(makeState({ mediaStatus: "uploading" })).ok).toBe(false);
    const err = canSubmitSpeaking(makeState({ mediaStatus: "error", mediaError: "Lỗi mạng" }));
    expect(err.ok).toBe(false);
    expect(err.reason).toBe("Lỗi mạng");
  });

  it("ok when audio uploaded (mediaId ready)", () => {
    expect(
      canSubmitSpeaking(makeState({ mediaStatus: "ready", mediaId: "media-1" })).ok,
    ).toBe(true);
  });

  it("ok for text-only fallback when no audio", () => {
    expect(canSubmitSpeaking(makeState({ notes: "  nội dung  " })).ok).toBe(true);
  });
});

describe("buildSpeakingSubmission", () => {
  it("sends mediaId when audio is ready — real audio path", () => {
    const input = buildSpeakingSubmission(
      makeState({ mediaStatus: "ready", mediaId: "media-1", notes: " ghi chú " }),
    );
    expect(input).toEqual({ mediaId: "media-1", body: "ghi chú" });
  });

  it("sends body only for text-only submission (→ not_assessable)", () => {
    const input = buildSpeakingSubmission(makeState({ notes: "chỉ văn bản" }));
    expect(input).toEqual({ body: "chỉ văn bản" });
    expect(input).not.toHaveProperty("mediaId");
    // invariant: client never sends assisted — shell/server derives it
    expect(input).not.toHaveProperty("assisted");
  });

  it("never attaches a mediaId that is not ready", () => {
    const input = buildSpeakingSubmission(
      makeState({ mediaStatus: "error", mediaId: "stale-id" }),
    );
    expect(input).not.toHaveProperty("mediaId");
  });
});

describe("buildSpeakingDraft", () => {
  it("returns notes as draft content", () => {
    expect(buildSpeakingDraft(makeState({ notes: "note" }))).toBe("note");
  });
});
