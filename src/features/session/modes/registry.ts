/**
 * Registry plugin theo kỹ năng — đặc tả §3.4.
 * Tra bằng modeSkill(mode): "ielts-reading" → skill "reading" → cùng plugin,
 * kèm cờ isIelts để shell hiện huy hiệu "IELTS".
 */
import { modeSkill } from "@/lib/modes";
import type { ModePlugin, Skill } from "./types";
import { writingPlugin } from "./writing";
import { readingPlugin } from "./reading";
import { speakingPlugin } from "./speaking";
import { listeningPlugin } from "./listening";

/** Cả 4 skill đều đã có plugin — mode lạ → resolvePlugin trả null. */
export const MODE_REGISTRY: Partial<Record<Skill, ModePlugin>> = {
  writing: writingPlugin,
  reading: readingPlugin,
  speaking: speakingPlugin,
  listening: listeningPlugin,
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
