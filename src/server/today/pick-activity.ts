import { selectLearningFocus, type LearningFocusProfile } from "@/lib/learning-focus";
export { getLearnerPracticeContext } from "./practice-context";

/**
 * Module chọn bài rule-based dùng chung cho /today và /library (gợi ý trong chủ đề).
 * - getLearnerPracticeContext: đọc DB (nháp dở, bài Bản 1 chưa viết lại, cân bằng 4 kỹ năng 7 ngày).
 * - pickRecommendedActivity: hàm THUẦN, chọn 1 bài từ danh sách ứng viên theo luật (a)/(c)/(d).
 */

export interface RecommendedActivity {
  id: string;
  slot: string | null;
  title: string;
  mode: string;
  objective: string | null;
  durationMinutes: number;
  reason: string;
  actionType: "continue_draft" | "start_revision" | "new_session";
  sessionId?: string;
  parentId?: string;
}

export interface CandidateActivity {
  id: string;
  slot: string | null;
  title: string;
  mode: string;
  objective: string | null;
  durationMinutes: number | null;
}

export interface PracticeContext {
  /** Nháp dở (>20 ký tự) của phiên đang active gần nhất */
  latestDraft: { sessionId: string; activityId: string } | null;
  /** Bài nộp Bản 1 chưa có Bản 2 */
  unrevisedSubmission: { id: string; activityId: string } | null;
  /** Số bài nộp trong 7 ngày qua theo kỹ năng */
  skillCounts: Record<string, number>;
  /** Kỹ năng ít luyện nhất trong 7 ngày qua */
  leastPracticedMode: string;
  /**
   * Id các activity learner đã có ít nhất 1 phiên completed — picker ưu tiên
   * bài CHƯA nằm trong danh sách này để xoay vòng hết inventory trước khi lặp.
   */
  completedActivityIds: string[];
  learningProfile?: LearningFocusProfile;
}

export const SKILL_NAMES_VI: Record<string, string> = {
  writing: "Viết",
  reading: "Đọc - Dịch y khoa",
  speaking: "Nói",
  listening: "Nghe & Shadowing",
};

export function normalizeSkillMode(mode: string | null | undefined): string | null {
  if (!mode) return null;
  if (mode.startsWith("ielts-")) {
    const sub = mode.slice("ielts-".length);
    if (["writing", "reading", "speaking", "listening"].includes(sub)) {
      return sub;
    }
  }
  if (["writing", "reading", "speaking", "listening"].includes(mode)) {
    return mode;
  }
  return null;
}

/** Thứ tự chuẩn của inventory: theo slot rồi id — khớp ORDER BY của /library. */
function compareCandidates(a: CandidateActivity, b: CandidateActivity): number {
  const slotCmp = (a.slot ?? "").localeCompare(b.slot ?? "");
  return slotCmp !== 0 ? slotCmp : a.id.localeCompare(b.id);
}

/**
 * Phần tử đầu của `pool`, nhưng bỏ qua các bài learner đã hoàn thành khi còn
 * bài chưa làm — inventory xoay vòng hết mới lặp lại bài cũ. Pool rỗng → undefined.
 */
function firstPreferringFresh(
  pool: CandidateActivity[],
  completed: ReadonlySet<string>
): CandidateActivity | undefined {
  if (pool.length === 0) return undefined;
  return pool.find((a) => !completed.has(a.id)) ?? pool[0];
}

/**
 * Chọn 1 bài từ `candidates` theo luật rule-based (hàm thuần, không đụng DB):
 * (a) nháp dở → (a) viết lại Bản 2 → (c)(d) kỹ năng ít luyện nhất.
 * Trong nhóm bài cùng kỹ năng: ưu tiên bài chưa có phiên completed nào
 * (xoay vòng hết inventory mới lặp), thứ tự deterministic theo (slot, id) —
 * không phụ thuộc thứ tự truy vấn của caller.
 * Chỉ chọn trong `candidates`; danh sách rỗng → null.
 */
export function pickRecommendedActivity(
  candidates: CandidateActivity[],
  ctx: PracticeContext,
  targetMinutes: 30 | 45
): RecommendedActivity | null {
  const { latestDraft, unrevisedSubmission, skillCounts } = ctx;
  const leastPracticedMode = ctx.learningProfile
    ? selectLearningFocus(skillCounts, ctx.learningProfile)
    : ctx.leastPracticedMode;

  if (latestDraft) {
    const act = candidates.find((a) => a.id === latestDraft.activityId);
    if (act) {
      return {
        id: act.id,
        slot: act.slot,
        title: act.title,
        mode: act.mode,
        objective: act.objective,
        durationMinutes: act.durationMinutes || 15,
        reason: `Bạn có một bản nháp đang làm dở cho bài này — tiếp tục để hoàn thiện ngay.`,
        actionType: "continue_draft",
        sessionId: latestDraft.sessionId,
      };
    }
  }

  if (unrevisedSubmission) {
    const act = candidates.find((a) => a.id === unrevisedSubmission.activityId);
    if (act) {
      return {
        id: act.id,
        slot: act.slot,
        title: act.title,
        mode: act.mode,
        objective: act.objective,
        durationMinutes: act.durationMinutes || 15,
        reason: `Bản 1 đã có nhận xét từ AI — viết/nói lại Bản 2 để khắc phục các điểm ưu tiên.`,
        actionType: "start_revision",
        parentId: unrevisedSubmission.id,
      };
    }
  }

  if (candidates.length === 0) return null;

  const completed = new Set(ctx.completedActivityIds);
  const sorted = [...candidates].sort(compareCandidates);

  // Ưu tiên bài thuộc kỹ năng ít luyện nhất (hỗ trợ cả ielts-*), xoay vòng
  // inventory: bài chưa hoàn thành đi trước, hết bài mới thì lặp lại từ đầu.
  const matchingSkillActs = sorted.filter(
    (a) => normalizeSkillMode(a.mode) === leastPracticedMode
  );
  const speakingActs = sorted.filter(
    (a) => normalizeSkillMode(a.mode) === "speaking"
  );
  const chosenAct =
    firstPreferringFresh(matchingSkillActs, completed) ??
    firstPreferringFresh(speakingActs, completed) ??
    firstPreferringFresh(sorted, completed);

  // candidates non-empty + fallback chuỗi trên luôn có phần tử — guard cho type.
  if (!chosenAct) return null;

  const chosenNorm = normalizeSkillMode(chosenAct.mode) || chosenAct.mode;
  let reasonText: string;

  if (chosenNorm === leastPracticedMode) {
    const skillName = SKILL_NAMES_VI[leastPracticedMode] || leastPracticedMode;
    const leastCount = skillCounts[leastPracticedMode] || 0;
    reasonText =
      leastCount === 0
        ? `Kỹ năng ${skillName} chưa được luyện bài nào trong 7 ngày qua — luyện hôm nay để cân bằng cả 4 kỹ năng.`
        : `Kỹ năng ${skillName} ít được luyện nhất tuần này (${leastCount} bài), vừa khít khung ${targetMinutes} phút.`;
  } else {
    const chosenSkillName = SKILL_NAMES_VI[chosenNorm] || chosenNorm;
    const chosenCount = skillCounts[chosenNorm] || 0;
    const leastSkillName = SKILL_NAMES_VI[leastPracticedMode] || leastPracticedMode;
    reasonText = `Chưa có bài ${leastSkillName} phù hợp trong danh sách. Gợi ý bài ${chosenSkillName} (${chosenCount} bài tuần này) vừa khung ${targetMinutes} phút.`;
  }

  return {
    id: chosenAct.id,
    slot: chosenAct.slot,
    title: chosenAct.title,
    mode: chosenAct.mode,
    objective: chosenAct.objective,
    durationMinutes: chosenAct.durationMinutes || 15,
    reason: reasonText,
    actionType: "new_session",
  };
}
