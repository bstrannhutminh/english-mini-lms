import { describe, expect, it } from "vitest";
import {
  manualTimerEvent,
  resolveVisibilityEvent,
  shouldSendTimeoutPause,
} from "@/features/session/hooks/session-event-policy";

describe("client session event policy", () => {
  it("nút đồng hồ map đúng trạng thái hiện tại", () => {
    expect(manualTimerEvent(true)).toBe("pause");
    expect(manualTimerEvent(false)).toBe("resume");
  });

  it("ẩn tab khi timer đang chạy → pause và đánh dấu auto-paused", () => {
    expect(
      resolveVisibilityEvent({
        visibility: "hidden",
        timerActive: true,
        autoPaused: false,
        finished: false,
      })
    ).toEqual({ event: "pause", pauseTimer: true, resumeTimer: false, autoPaused: true });
  });

  it("ẩn tab khi learner đã pause tay → không gửi pause thừa", () => {
    expect(
      resolveVisibilityEvent({
        visibility: "hidden",
        timerActive: false,
        autoPaused: false,
        finished: false,
      }).event
    ).toBeNull();
  });

  it("hiện lại chỉ resume khi chính visibility đã auto-pause", () => {
    const auto = resolveVisibilityEvent({
      visibility: "visible",
      timerActive: false,
      autoPaused: true,
      finished: false,
    });
    expect(auto).toEqual({ event: "resume", pauseTimer: false, resumeTimer: true, autoPaused: false });

    const manual = resolveVisibilityEvent({
      visibility: "visible",
      timerActive: false,
      autoPaused: false,
      finished: false,
    });
    expect(manual.event).toBeNull();
    expect(manual.resumeTimer).toBe(false);
  });

  it("sau finish, visibility không được phát thêm pause/resume", () => {
    expect(
      resolveVisibilityEvent({
        visibility: "hidden",
        timerActive: true,
        autoPaused: false,
        finished: true,
      }).event
    ).toBeNull();
  });

  it("timeout pause chỉ gửi một lần cho mỗi lần hết giờ", () => {
    expect(shouldSendTimeoutPause({ finished: false, alreadySent: false })).toBe(true);
    expect(shouldSendTimeoutPause({ finished: false, alreadySent: true })).toBe(false);
    expect(shouldSendTimeoutPause({ finished: true, alreadySent: false })).toBe(false);
  });
});
