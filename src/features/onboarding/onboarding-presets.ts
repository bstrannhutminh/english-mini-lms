import type { IconName } from "@/components/ui";
import type { OnboardingPayload, OnboardingProfile } from "@/contracts/onboarding";
import type { Skill } from "@/lib/modes";
import { selectLearningFocus } from "@/lib/learning-focus";

export interface PriorityCardOption {
  value: string;
  title: string;
  subtitle: string;
  icon: IconName;
}

/** Các mục tiêu học tập phổ biến cho bác sĩ — tương thích dữ liệu priorities cũ. */
export const PRIORITY_CARDS: PriorityCardOption[] = [
  {
    value: "Giao tiếp hội nghị y khoa & thuyết trình",
    title: "Hội nghị & thuyết trình",
    subtitle: "Tự giới thiệu, trình bày ca bệnh, trả lời Q&A và viết email học thuật",
    icon: "mic",
  },
  {
    value: "Đọc hiểu và dịch sách/bài báo y khoa chuyên sâu",
    title: "Đọc–dịch sách y khoa",
    subtitle: "Đọc đoạn sách chuyên ngành, dịch sát nghĩa và lưu thuật ngữ 1 chạm",
    icon: "book-open",
  },
  {
    value: "Giao tiếp lâm sàng với bệnh nhân nước ngoài",
    title: "Giao tiếp lâm sàng",
    subtitle: "Hỏi bệnh sử, giải thích thủ thuật và tư vấn dễ hiểu bằng tiếng Anh",
    icon: "stethoscope",
  },
  {
    value: "Luyện thi IELTS mục tiêu 7.5 - 8.0",
    title: "Luyện IELTS 7.5–8.0",
    subtitle: "Rèn 4 kỹ năng theo rubric rõ ràng (điểm ước lượng luyện tập)",
    icon: "graduation-cap",
  },
  {
    value: "Phản xạ nghe - nói giao tiếp hàng ngày",
    title: "Phản xạ nghe–nói hằng ngày",
    subtitle: "Nghe hội thoại thật, shadowing ngữ điệu và luyện nói ngắn 1–3 phút",
    icon: "headphones",
  },
];

export const WORK_CONTEXT_CHIPS = [
  "Bác sĩ Cơ Xương Khớp & Siêu âm can thiệp",
  "Đọc giáo trình và bài báo PubMed hằng tuần",
  "Chuẩn bị báo cáo & giao lưu hội nghị quốc tế",
  "Khám và giải thích thủ thuật cho bệnh nhân nước ngoài",
] as const;

export const STUDY_TIME_PRESETS = [
  { time: "06:30", label: "Sáng sớm", note: "Tỉnh táo trước giờ làm" },
  { time: "12:30", label: "Nghỉ trưa", note: "Tranh thủ giữa ca" },
  { time: "21:00", label: "Buổi tối", note: "Yên tĩnh cuối ngày" },
] as const;

export const BOOK_PRESETS = [
  "Musculoskeletal Ultrasound Handbook",
  "NYSORA Regional Anesthesia",
  "Pain Management Clinical Guidelines",
] as const;

export const SKILL_LEVEL_LABELS: Record<number, { short: string; detail: string }> = {
  1: { short: "Mới làm quen", detail: "Cần gợi ý nhiều và tốc độ chậm" },
  2: { short: "Cơ bản", detail: "Hiểu ý chính nhưng còn ngập ngừng" },
  3: { short: "Dùng được", detail: "Làm việc được trong tình huống quen" },
  4: { short: "Khá tự tin", detail: "Diễn đạt rõ, cần tinh chỉnh tự nhiên hơn" },
  5: { short: "Thành thạo", detail: "Tự tin, muốn nâng độ chuẩn học thuật" },
};

export interface OnboardingDraft {
  displayName: string;
  priorities: string[];
  selfAssessment: Record<Skill, number>;
  workContext: string;
  ieltsVariant: "academic" | "general" | "none";
  currentBook: string;
  preferredStudyTime: string;
  targetMinutesDefault: 30 | 45;
}

export interface OnboardingSummary {
  focusSkill: Skill;
  focusSkillLabel: string;
  minutesSplit: { warmup: number; main: number; revise: number; wrapup: number };
  priorityCount: number;
  ieltsLabel: string;
}

const SKILL_VI: Record<Skill, string> = {
  writing: "Viết thực tế",
  reading: "Đọc–dịch y khoa",
  speaking: "Nói & Hội thoại",
  listening: "Nghe & Shadowing",
};

/** Tạo trạng thái khởi đầu của Wizard từ hồ sơ DB (hoặc mặc định thân thiện). */
export function createInitialDraft(
  profile: OnboardingProfile | null
): OnboardingDraft {
  const mins = profile?.targetMinutesDefault === 45 ? 45 : 30;
  return {
    displayName: profile?.displayName?.trim() || "Bác sĩ Minh",
    priorities:
      profile
        ? [...profile.priorities]
        : [PRIORITY_CARDS[0].value, PRIORITY_CARDS[1].value],
    selfAssessment: {
      writing: profile?.selfAssessment.writing ?? 3,
      reading: profile?.selfAssessment.reading ?? 3,
      speaking: profile?.selfAssessment.speaking ?? 3,
      listening: profile?.selfAssessment.listening ?? 3,
    },
    workContext: profile?.workContext ?? "",
    ieltsVariant: profile?.ieltsVariant || "none",
    currentBook: profile?.currentBook ?? "",
    preferredStudyTime: profile?.preferredStudyTime ?? "21:00",
    targetMinutesDefault: mins,
  };
}

/** Save exactly the reviewed choices, keeping optional blanks and the Lite duration. */
export function buildOnboardingPayload(draft: OnboardingDraft): OnboardingPayload {
  return {
    displayName: draft.displayName.trim() || "Bác sĩ Minh",
    priorities: [...draft.priorities],
    selfAssessment: { ...draft.selfAssessment },
    workContext: draft.workContext.trim(),
    ieltsVariant: draft.ieltsVariant === "none" ? null : draft.ieltsVariant,
    currentBook: draft.currentBook.trim(),
    preferredStudyTime: draft.preferredStudyTime,
    targetMinutesDefault: draft.targetMinutesDefault,
  };
}

/** Xác định người học mới có nên vào Onboarding lần đầu hay không (hàm thuần). */
export function needsFirstRunOnboarding(learner: {
  baselineStatus?: string | null;
  preferences?: Record<string, unknown> | null;
}): boolean {
  if (learner.baselineStatus === "completed") return false;
  if (learner.preferences?.onboardingSkipped === true) return false;
  return true;
}

/** Lấy thời lượng mục tiêu mặc định từ preferences (chỉ 30 hoặc 45 phút). */
export function resolveDefaultTargetMinutes(
  preferences?: Record<string, unknown> | null
): 30 | 45 {
  return preferences?.targetMinutesDefault === 45 ? 45 : 30;
}

/** Tóm tắt lộ trình khởi đầu từ dữ liệu người học vừa chọn (không suy diễn band/CEFR). */
export function buildOnboardingSummary(draft: OnboardingDraft): OnboardingSummary {
  const focusSkill = selectLearningFocus({}, draft);

  const minutesSplit =
    draft.targetMinutesDefault === 45
      ? { warmup: 5, main: 22, revise: 15, wrapup: 3 }
      : { warmup: 5, main: 15, revise: 8, wrapup: 2 };

  const ieltsLabel =
    draft.ieltsVariant === "academic"
      ? "IELTS Academic (ưu tiên học thuật)"
      : draft.ieltsVariant === "general"
        ? "IELTS General Training"
        : "Tập trung tiếng Anh thực tế & y khoa";

  return {
    focusSkill,
    focusSkillLabel: SKILL_VI[focusSkill],
    minutesSplit,
    priorityCount: draft.priorities.length,
    ieltsLabel,
  };
}
