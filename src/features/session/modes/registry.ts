/**
 * Registry plugin theo kỹ năng — đặc tả §3.4.
 * Tra bằng modeSkill(mode): "ielts-reading" → skill "reading" → cùng plugin,
 * kèm cờ isIelts để shell hiện huy hiệu "IELTS".
 */
import { modeSkill } from "@/lib/modes";
import type { ModePlugin, Skill } from "./types";
import { writingPlugin } from "./writing";

/**
 * Plugin đã port; các skill còn lại (reading/speaking/listening) do agent
 * B1/B2 bổ sung — page.tsx fallback về view cũ khi plugin chưa có.
 */
export const MODE_REGISTRY: Partial<Record<Skill, ModePlugin>> = {
  writing: writingPlugin,
};

export interface ResolvedMode {
  skill: Skill;
  /** activity.mode có tiền tố "ielts-" → shell hiện badge IELTS. */
  isIelts: boolean;
  /** null khi skill chưa có plugin → caller render view cũ. */
  plugin: ModePlugin | null;
}

/** "ielts-writing" → { skill: "writing", isIelts: true, plugin } ; mode lạ → null. */
export function resolvePlugin(mode: string): ResolvedMode | null {
  const skill = modeSkill(mode);
  if (!skill) return null;
  return {
    skill,
    isIelts: mode.startsWith("ielts-"),
    plugin: MODE_REGISTRY[skill] ?? null,
  };
}
