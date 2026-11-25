/**
 * Quyết định thuần cho lifecycle events phía client.
 * Tách khỏi React để test hermetic; server vẫn là nơi chốt active_seconds.
 */
export type TimerLifecycleEvent = "pause" | "resume" | "finish";

/** Nút đồng hồ trên header: đang chạy → pause, đang dừng → resume. */
export function manualTimerEvent(timerActive: boolean): "pause" | "resume" {
  return timerActive ? "pause" : "resume";
}

export interface VisibilityDecisionInput {
  visibility: "hidden" | "visible";
  timerActive: boolean;
  autoPaused: boolean;
  finished: boolean;
}

export interface VisibilityDecision {
  event: "pause" | "resume" | null;
  pauseTimer: boolean;
  resumeTimer: boolean;
  autoPaused: boolean;
}

/**
 * Ẩn tab/app → pause chỉ khi đồng hồ thật sự đang chạy.
 * Hiện lại → resume CHỈ khi chính visibility đã auto-pause trước đó;
 * không tự ý resume khi người học đã bấm pause tay.
 */
export function resolveVisibilityEvent({
  visibility,
  timerActive,
  autoPaused,
  finished,
}: VisibilityDecisionInput): VisibilityDecision {
  const idle = {
    event: null,
    pauseTimer: false,
    resumeTimer: false,
    autoPaused,
  } as const;

  if (finished) return idle;

  if (visibility === "hidden") {
    if (!timerActive || autoPaused) return idle;
    return {
      event: "pause",
      pauseTimer: true,
      resumeTimer: false,
      autoPaused: true,
    };
  }

  if (autoPaused) {
    return {
      event: "resume",
      pauseTimer: false,
      resumeTimer: true,
      autoPaused: false,
    };
  }

  return idle;
}

/** Hết giờ chỉ ghi pause một lần cho mỗi lượt countdown; extend sẽ reset guard. */
export function shouldSendTimeoutPause(input: {
  finished: boolean;
  alreadySent: boolean;
}): boolean {
  return !input.finished && !input.alreadySent;
}
