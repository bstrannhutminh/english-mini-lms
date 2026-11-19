/**
 * Lưu/đọc trạng thái đồng hồ phiên học theo sessionId trong sessionStorage.
 * Tách hàm thuần để dễ unit test và chịu lỗi an toàn khi trình duyệt chặn storage.
 */
export interface PersistedTimerState {
  /** Mốc thời gian hết giờ (epoch ms) khi đồng hồ đang chạy; null khi đang tạm dừng. */
  deadlineMs: number | null;
  /** Số giây còn lại tại thời điểm tạm dừng (hoặc dự phòng). */
  remainingSeconds: number;
  paused: boolean;
}

export function timerStorageKey(sessionId: string): string {
  return `lms:session-timer:${sessionId}`;
}

export function computeRemainingFromPersisted(
  state: PersistedTimerState,
  nowMs: number = Date.now()
): { secondsRemaining: number; paused: boolean } {
  if (state.paused || state.deadlineMs === null) {
    return {
      secondsRemaining: Math.max(0, Math.floor(state.remainingSeconds)),
      paused: true,
    };
  }
  const left = Math.max(0, Math.ceil((state.deadlineMs - nowMs) / 1000));
  return { secondsRemaining: left, paused: false };
}

export function readPersistedTimer(
  sessionId: string,
  nowMs: number = Date.now()
): { secondsRemaining: number; paused: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(timerStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
    if (typeof parsed.remainingSeconds !== "number") return null;
    return computeRemainingFromPersisted(
      {
        deadlineMs:
          typeof parsed.deadlineMs === "number" ? parsed.deadlineMs : null,
        remainingSeconds: parsed.remainingSeconds,
        paused: Boolean(parsed.paused),
      },
      nowMs
    );
  } catch {
    return null;
  }
}

export function writePersistedTimer(
  sessionId: string,
  secondsRemaining: number,
  paused: boolean,
  nowMs: number = Date.now()
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedTimerState = {
      deadlineMs: paused ? null : nowMs + secondsRemaining * 1000,
      remainingSeconds: secondsRemaining,
      paused,
    };
    window.sessionStorage.setItem(
      timerStorageKey(sessionId),
      JSON.stringify(payload)
    );
  } catch {
    // Bỏ qua khi chế độ riêng tư chặn sessionStorage
  }
}

export function clearPersistedTimer(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(timerStorageKey(sessionId));
  } catch {
    // Bỏ qua
  }
}
