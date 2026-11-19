/**
 * MODE_META — NGUỒN DUY NHẤT định nghĩa ActivityMode → kỹ năng, nhãn tiếng Việt,
 * màu accent (token trong globals.css) và tên icon (components/ui/icons.tsx).
 *
 * Mọi màn hình (Hôm nay, Thư viện, Học, Sổ từ, Bài của tôi, Tiến độ, Admin)
 * phải lấy nhãn/màu/icon từ đây thay vì tự khai MODE_CONFIG/MODE_LABELS cục bộ.
 *
 * Quyết định D-4: mode "ielts-*" dùng CHUNG skill + màu với bản thường,
 * chỉ thêm cờ isIelts để hiển thị huy hiệu "IELTS".
 */

import type { ActivityMode } from "./content-constants";

/** Kỹ năng gốc — mọi mode quy về 1 trong 4. */
export type Skill = "writing" | "reading" | "speaking" | "listening";

/**
 * "ielts-listening" → "listening". Mode lạ (không hợp lệ) trả null —
 * caller quyết định fallback, không throw.
 */
export function modeSkill(mode: string): Skill | null {
  const skill = mode.replace(/^ielts-/, "");
  return skill === "writing" ||
    skill === "reading" ||
    skill === "speaking" ||
    skill === "listening"
    ? skill
    : null;
}

export function isIeltsMode(mode: string): boolean {
  return mode.startsWith("ielts-");
}

/** Tên icon trong components/ui/icons.tsx (icon "pen-tool", "book-open"…). */
export type ModeIconName = "pen-tool" | "book-open" | "mic" | "headphones";

export interface ModeMeta {
  /** Mode đầy đủ, ví dụ "ielts-writing". */
  mode: ActivityMode;
  /** Kỹ năng gốc — dùng để chọn plugin/registry ở màn Học. */
  skill: Skill;
  /** Nhãn đầy đủ, ví dụ "Đọc – Dịch y khoa". */
  label: string;
  /** Nhãn ngắn cho chip/badge, ví dụ "Đọc–dịch". */
  shortLabel: string;
  /** Tên icon của kỹ năng. */
  icon: ModeIconName;
  /** true → hiển thị thêm huy hiệu "IELTS". */
  isIelts: boolean;
  /** Tone của <Badge> / accent classes — trùng tên token --color-skill-*. */
  tone: Skill;
  /** Lớp chip: nền nhạt + chữ đậm + viền (màu lấy từ token skill). */
  badgeClass: string;
  /** Lớp màu chữ cho icon khi đặt trên nền nhạt. */
  iconClass: string;
  /** Lớp nền nhạt đơn (không viền/chữ). */
  softBgClass: string;
}

const SKILL_META: Record<
  Skill,
  Pick<ModeMeta, "label" | "shortLabel" | "icon" | "badgeClass" | "iconClass" | "softBgClass">
> = {
  writing: {
    label: "Viết chuyên môn",
    shortLabel: "Viết",
    icon: "pen-tool",
    badgeClass:
      "bg-skill-writing-soft text-skill-writing border-skill-writing-border",
    iconClass: "text-skill-writing",
    softBgClass: "bg-skill-writing-soft",
  },
  reading: {
    label: "Đọc – Dịch y khoa",
    shortLabel: "Đọc–dịch",
    icon: "book-open",
    badgeClass:
      "bg-skill-reading-soft text-skill-reading border-skill-reading-border",
    iconClass: "text-skill-reading",
    softBgClass: "bg-skill-reading-soft",
  },
  speaking: {
    label: "Nói / Giao tiếp",
    shortLabel: "Nói",
    icon: "mic",
    badgeClass:
      "bg-skill-speaking-soft text-skill-speaking border-skill-speaking-border",
    iconClass: "text-skill-speaking",
    softBgClass: "bg-skill-speaking-soft",
  },
  listening: {
    label: "Nghe / Shadowing",
    shortLabel: "Nghe",
    icon: "headphones",
    badgeClass:
      "bg-skill-listening-soft text-skill-listening border-skill-listening-border",
    iconClass: "text-skill-listening",
    softBgClass: "bg-skill-listening-soft",
  },
};

function buildMeta(mode: ActivityMode): ModeMeta {
  const skill = modeSkill(mode) as Skill; // ActivityMode luôn quy về 4 skill
  return {
    mode,
    skill,
    tone: skill,
    isIelts: isIeltsMode(mode),
    ...SKILL_META[skill],
  };
}

export const MODE_META: Record<ActivityMode, ModeMeta> = {
  writing: buildMeta("writing"),
  reading: buildMeta("reading"),
  speaking: buildMeta("speaking"),
  listening: buildMeta("listening"),
  "ielts-writing": buildMeta("ielts-writing"),
  "ielts-reading": buildMeta("ielts-reading"),
  "ielts-speaking": buildMeta("ielts-speaking"),
  "ielts-listening": buildMeta("ielts-listening"),
};

/** Meta theo kỹ năng (bỏ qua biến thể IELTS) — dùng cho nhóm/tổng hợp. */
export const SKILL_INFO: Record<Skill, Omit<ModeMeta, "mode" | "isIelts">> = {
  writing: { skill: "writing", tone: "writing", ...SKILL_META.writing },
  reading: { skill: "reading", tone: "reading", ...SKILL_META.reading },
  speaking: { skill: "speaking", tone: "speaking", ...SKILL_META.speaking },
  listening: { skill: "listening", tone: "listening", ...SKILL_META.listening },
};

const FALLBACK_META: ModeMeta = {
  mode: "writing",
  skill: "writing",
  label: "Hoạt động",
  shortLabel: "Khác",
  icon: "book-open",
  isIelts: false,
  tone: "writing",
  badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  iconClass: "text-slate-500",
  softBgClass: "bg-slate-100",
};

/**
 * Tra meta theo mode; mode lạ/không hợp lệ → meta trung tính (slate)
 * thay vì throw — UI vẫn hiển thị được tên mode thô.
 */
export function modeMeta(mode: string): ModeMeta {
  const skill = modeSkill(mode);
  if (!skill) {
    return { ...FALLBACK_META, label: mode, shortLabel: mode };
  }
  return {
    mode: mode as ActivityMode,
    skill,
    tone: skill,
    isIelts: isIeltsMode(mode),
    ...SKILL_META[skill],
  };
}
