/**
 * State machine thuần cho đồng hồ học (active_seconds) từ lifecycle events.
 *
 * Quy ước quan trọng:
 * - hint/reveal KHÔNG làm thay đổi trạng thái chạy giờ; caller chỉ truyền
 *   lifecycle event gần nhất (pause/resume/finish).
 * - Không có lifecycle event nào → mốc bắt đầu là created_at của session.
 * - finish là terminal: event finish/pause/resume đến muộn sau đó không cộng
 *   thêm giây và không mở lại phiên.
 * - Nếu session đã completed do luồng nộp bài cũ nhưng chưa có event finish,
 *   một pause/finish đến sau vẫn được dùng để chốt đoạn thời gian đang chạy,
 *   nhưng pause không được đổi status completed thành paused.
 */
export type SessionLifecycleEventKind = "pause" | "resume" | "finish";
export type LearningSessionStatus =
  | "ready"
  | "active"
  | "paused"
  | "completed"
  | "abandoned";

export interface SessionClockInput {
  incomingKind: SessionLifecycleEventKind;
  currentStatus: string;
  currentActiveSeconds: number | null;
  sessionCreatedAt: Date;
  lastLifecycleEvent: {
    kind: SessionLifecycleEventKind;
    eventAt: Date;
  } | null;
  now: Date;
}

export interface SessionClockTransition {
  activeSeconds: number;
  nextStatus: LearningSessionStatus;
  countedSeconds: number;
}

export function isSessionLifecycleEventKind(
  kind: string
): kind is SessionLifecycleEventKind {
  return kind === "pause" || kind === "resume" || kind === "finish";
}

/** Tính delta + status mới cho một lifecycle event, idempotent với event lặp. */
export function calculateSessionClockTransition({
  incomingKind,
  currentStatus,
  currentActiveSeconds,
  sessionCreatedAt,
  lastLifecycleEvent,
  now,
}: SessionClockInput): SessionClockTransition {
  const storedSeconds = Math.max(0, currentActiveSeconds ?? 0);
  const status = currentStatus as LearningSessionStatus;

  // finish đã ghi nhận là terminal tuyệt đối — chống double-count khi client retry.
  if (lastLifecycleEvent?.kind === "finish") {
    return {
      activeSeconds: storedSeconds,
      nextStatus: "completed",
      countedSeconds: 0,
    };
  }

  // Abandoned là trạng thái kết thúc khác; không cho lifecycle event mở lại.
  if (status === "abandoned") {
    return {
      activeSeconds: storedSeconds,
      nextStatus: "abandoned",
      countedSeconds: 0,
    };
  }

  // Nguồn thật là lifecycle event gần nhất. Khi chưa có event nào, session
  // active/ready/completed (legacy submit) được xem là đang trong đoạn học;
  // riêng paused không cộng vì không biết đã dừng từ bao giờ.
  const wasActive = lastLifecycleEvent
    ? lastLifecycleEvent.kind === "resume"
    : status !== "paused";

  let countedSeconds = 0;
  if ((incomingKind === "pause" || incomingKind === "finish") && wasActive) {
    const startedAt = lastLifecycleEvent?.eventAt ?? sessionCreatedAt;
    countedSeconds = Math.max(
      0,
      Math.round((now.getTime() - startedAt.getTime()) / 1000)
    );
  }

  let nextStatus: LearningSessionStatus;
  if (incomingKind === "finish") {
    nextStatus = "completed";
  } else if (incomingKind === "pause") {
    // pause đến muộn sau khi submit đã đóng phiên không được mở lại phiên.
    nextStatus = status === "completed" ? "completed" : "paused";
  } else {
    // resume không bao giờ mở lại phiên đã completed.
    nextStatus = status === "completed" ? "completed" : "active";
  }

  return {
    activeSeconds: storedSeconds + countedSeconds,
    nextStatus,
    countedSeconds,
  };
}
