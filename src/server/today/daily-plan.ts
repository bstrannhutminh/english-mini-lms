/**
 * buildDailyPlan — hàm THUẦN dựng "Kế hoạch phiên" cho hub Hôm nay
 * (spec §3.3): Ôn từ đến hạn (≤5') → Bài chính → Sửa/vận dụng → Kết thúc.
 *
 * Trạng thái mỗi bước được SUY RA từ dữ liệu hiện có (từ đến hạn, submissions
 * hôm nay, phiên đang dở, bản 1 chờ sửa) — không thêm bảng mới (quyết định D-5).
 * "Bỏ qua được" = mỗi bước là deep-link; không lưu trạng thái skip.
 *
 * Mở rộng pick-activity.ts: pick quyết định BÀI NÀO, buildDailyPlan quyết định
 * THỨ TỰ BƯỚC của buổi học. Mọi description là tiếng Việt, giải thích được.
 */
import type {
  PlanStep,
  PlanStepKey,
  PlanStepStatus,
} from "@/contracts/today";

export type { PlanStep, PlanStepKey, PlanStepStatus };

/** Đầu vào tối thiểu để suy ra trạng thái từng bước — service.ts đổ dữ liệu. */
export interface DailyPlanContext {
  /** Số từ đến hạn ôn (vocabulary_vault.due_at <= now). 0 = đã ôn xong/không có. */
  dueVocabCount: number;
  /** Phiên đang active/paused → bước Bài chính deep-link thẳng /learn/[id]. */
  inProgressSessionId: string | null;
  /** Bài được gợi ý (pickRecommendedActivity); null khi thư viện trống. */
  recommendedActivityId: string | null;
  /** Đã nộp ≥1 bài hôm nay (giờ VN) — kể cả bản sửa, vì đó cũng là việc chính. */
  submittedToday: boolean;
  /** Đã nộp bản sửa (revision ≥ 2 / có parent_id) hôm nay. */
  revisedToday: boolean;
  /** Bản 1 đã có góp ý AI mà chưa có Bản 2 → deep-link /my-work/[id]. */
  unrevisedSubmissionId: string | null;
}

/** Ngân sách phút theo khung 30'/45' (tổng = targetMinutes). */
const BUDGET = {
  warmup: 5,
  main: { 30: 15, 45: 22 } as const,
  revise: { 30: 8, 45: 15 } as const,
} as const;

interface StepSeed {
  key: PlanStepKey;
  title: string;
  description: string;
  estimatedMinutes: number;
  href: string | null;
  done: boolean;
}

/**
 * Mốc 00:00 hôm nay theo giờ Việt Nam. Asia/Ho_Chi_Minh cố định UTC+7
 * (không DST) — cùng mốc ngày với computeStreakDays trong service.ts.
 */
export function startOfTodayVietnam(now = new Date()): Date {
  const dayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${dayStr}T00:00:00+07:00`);
}

export function buildDailyPlan(
  context: DailyPlanContext,
  targetMinutes: 30 | 45
): PlanStep[] {
  const warmupDone = context.dueVocabCount === 0;
  const mainDone = context.submittedToday;
  const revisePending = context.unrevisedSubmissionId !== null;
  // "Sửa/vận dụng" xong khi không còn bản nào chờ sửa VÀ hôm nay đã có việc
  // chính (nộp bài mới hoặc đã sửa một bản). Còn bản chờ → chưa xong dù
  // đã lỡ sửa bài khác trong ngày.
  const reviseDone = !revisePending && context.submittedToday;
  const wrapupDone = warmupDone && mainDone && reviseDone;

  const wrapupMinutes =
    targetMinutes - BUDGET.warmup - BUDGET.main[targetMinutes] - BUDGET.revise[targetMinutes];

  const seeds: StepSeed[] = [
    {
      key: "warmup",
      title: "Ôn từ đến hạn",
      estimatedMinutes: BUDGET.warmup,
      href: "/vocab/flashcards",
      done: warmupDone,
      description:
        context.dueVocabCount > 0
          ? `Còn ${context.dueVocabCount} từ đến hạn — ôn trước giúp khắc sâu vào trí nhớ dài hạn.`
          : "Không có từ nào đến hạn hôm nay.",
    },
    {
      key: "main",
      title: "Bài chính",
      estimatedMinutes: BUDGET.main[targetMinutes],
      href: context.inProgressSessionId
        ? `/learn/${context.inProgressSessionId}`
        : context.recommendedActivityId
          ? `/library/${context.recommendedActivityId}`
          : "/library",
      done: mainDone,
      description: context.inProgressSessionId
        ? "Bạn có phiên đang dở — quay lại hoàn thành trước khi mở bài mới."
        : context.recommendedActivityId
          ? "Làm bài được gợi ý theo kỹ năng đang cần luyện nhất."
          : "Chọn một bài trong Thư viện để bắt đầu.",
    },
    {
      key: "revise",
      title: "Sửa / vận dụng",
      estimatedMinutes: BUDGET.revise[targetMinutes],
      href: context.unrevisedSubmissionId
        ? `/my-work/${context.unrevisedSubmissionId}`
        : "/my-work",
      done: reviseDone,
      description: revisePending
        ? "Có bài Bản 1 đã nhận góp ý AI — viết/nói lại Bản 2 để khắc phục lỗi ưu tiên."
        : context.submittedToday
          ? "Không còn bài nào đang chờ sửa."
          : "Bước này mở ra sau khi bạn nộp bài chính và nhận góp ý.",
    },
    {
      key: "wrapup",
      title: "Kết thúc",
      estimatedMinutes: wrapupMinutes,
      href: "/progress",
      done: wrapupDone,
      description: "Nhìn lại phút thực học và các lỗi đã ghi nhận trong ngày.",
    },
  ];

  // Bước chưa xong đầu tiên = "current"; các bước chưa xong sau đó = "upcoming".
  let currentAssigned = false;
  return seeds.map((seed) => {
    let status: PlanStepStatus = "done";
    if (!seed.done) {
      status = currentAssigned ? "upcoming" : "current";
      currentAssigned = true;
    }
    return {
      key: seed.key,
      title: seed.title,
      description: seed.description,
      estimatedMinutes: seed.estimatedMinutes,
      href: seed.href,
      status,
    };
  });
}
