import type { ActivityListItemContract, LearningStatus } from "@/contracts/library";
import { isIeltsMode, modeSkill, type Skill } from "@/lib/modes";
import { UNCATEGORIZED_TOPIC } from "@/lib/topics";

export type LibrarySkillFilter = "all" | Skill | "ielts";
export type LibraryStatusFilter = "all" | LearningStatus;

export interface LibraryFilterState {
  topic: string | null;
  skill: LibrarySkillFilter;
  status: LibraryStatusFilter;
  query: string;
}

function normalizeVietnamese(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

/**
 * Lọc danh sách bài học trong Thư viện theo chủ đề, kỹ năng/IELTS,
 * trạng thái học và từ khoá tìm kiếm (hàm thuần — không chạm DB).
 */
export function filterLibraryActivities(
  activities: ActivityListItemContract[],
  filters: LibraryFilterState
): ActivityListItemContract[] {
  const q = normalizeVietnamese(filters.query);

  return activities.filter((act) => {
    // 1. Lọc theo chủ đề
    if (filters.topic) {
      const actTopic = act.topic ?? UNCATEGORIZED_TOPIC;
      if (actTopic !== filters.topic) return false;
    }

    // 2. Lọc theo kỹ năng hoặc IELTS
    if (filters.skill === "ielts") {
      if (!isIeltsMode(act.mode)) return false;
    } else if (filters.skill !== "all") {
      if (modeSkill(act.mode) !== filters.skill) return false;
    }

    // 3. Lọc theo trạng thái học tập
    if (filters.status !== "all") {
      const status: LearningStatus =
        act.learningStatus ??
        ((act.submissionCount ?? 0) > 0 ? "completed" : "not_started");
      if (status !== filters.status) return false;
    }

    // 4. Tìm kiếm không phân biệt dấu trên tiêu đề, mục tiêu, slot
    if (q) {
      const haystack = normalizeVietnamese(
        [act.title, act.objective ?? "", act.slot ?? "", act.id].join(" ")
      );
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
