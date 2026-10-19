/**
 * INVARIANT — routing mode → skill → plugin:
 *  - modeSkill() là nguồn duy nhất: "ielts-*" quy về đúng 4 skill.
 *  - resolvePlugin() trả plugin cho CẢ 8 ActivityMode (màn Học không
 *    được rơi về view cũ cho mode hợp lệ nào).
 */
import { describe, expect, it } from "vitest";
import { ACTIVITY_MODES } from "@/lib/content-constants";
import { modeSkill, type Skill } from "@/lib/modes";
import { MODE_REGISTRY, resolvePlugin } from "@/features/session/modes/registry";

const EXPECTED_SKILL: Record<string, Skill> = {
  writing: "writing",
  reading: "reading",
  speaking: "speaking",
  listening: "listening",
  "ielts-writing": "writing",
  "ielts-reading": "reading",
  "ielts-speaking": "speaking",
  "ielts-listening": "listening",
};

describe("modeSkill — mọi ielts-* quy về đúng skill gốc", () => {
  it.each(Object.entries(EXPECTED_SKILL))("%s → %s", (mode, skill) => {
    expect(modeSkill(mode)).toBe(skill);
  });

  it("mode lạ → null, không đoán bừa", () => {
    expect(modeSkill("ielts-karaoke")).toBeNull();
    expect(modeSkill("")).toBeNull();
    expect(modeSkill("ielts-")).toBeNull();
  });
});

describe("resolvePlugin — plugin cho cả 8 ActivityMode", () => {
  it("MODE_REGISTRY đủ 4 skill", () => {
    for (const skill of ["writing", "reading", "speaking", "listening"] as const) {
      expect(MODE_REGISTRY[skill], `thiếu plugin cho ${skill}`).toBeTruthy();
    }
  });

  it.each(ACTIVITY_MODES)("mode %s resolve ra plugin đúng skill + cờ isIelts", (mode) => {
    const resolved = resolvePlugin(mode);
    expect(resolved).not.toBeNull();
    expect(resolved!.skill).toBe(EXPECTED_SKILL[mode]);
    expect(resolved!.isIelts).toBe(mode.startsWith("ielts-"));
    expect(resolved!.plugin).not.toBeNull();
    expect(resolved!.plugin!.skill).toBe(EXPECTED_SKILL[mode]);
  });

  it("plugin đủ contract tối thiểu (Panel + initialState + canSubmit + buildSubmission)", () => {
    const seen = new Set<string>();
    for (const mode of ACTIVITY_MODES) {
      const plugin = resolvePlugin(mode)!.plugin!;
      seen.add(plugin.skill);
      expect(typeof plugin.Panel).toBe("function");
      expect(typeof plugin.initialState).toBe("function");
      expect(typeof plugin.canSubmit).toBe("function");
      expect(typeof plugin.buildSubmission).toBe("function");
      expect(typeof plugin.buildDraft).toBe("function");
    }
    expect(seen.size).toBe(4); // đúng 4 plugin instance cho 8 mode
  });

  it("mode lạ → null (shell fallback, không crash)", () => {
    expect(resolvePlugin("karaoke")).toBeNull();
  });
});
