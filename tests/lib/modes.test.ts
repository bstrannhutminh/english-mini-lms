import { describe, expect, it } from "vitest";
import { ACTIVITY_MODES } from "@/lib/content-constants";
import { isIeltsMode, MODE_META, modeMeta, modeSkill } from "@/lib/modes";

describe("modeSkill — canonical mode → skill mapping", () => {
  it("maps the 4 plain skills to themselves", () => {
    expect(modeSkill("writing")).toBe("writing");
    expect(modeSkill("reading")).toBe("reading");
    expect(modeSkill("speaking")).toBe("speaking");
    expect(modeSkill("listening")).toBe("listening");
  });

  it("strips the ielts- prefix (D-4: IELTS shares the same skill)", () => {
    expect(modeSkill("ielts-writing")).toBe("writing");
    expect(modeSkill("ielts-reading")).toBe("reading");
    expect(modeSkill("ielts-speaking")).toBe("speaking");
    expect(modeSkill("ielts-listening")).toBe("listening");
  });

  it("returns null for unknown modes instead of throwing", () => {
    expect(modeSkill("ielts-foo")).toBeNull();
    expect(modeSkill("shadowing")).toBeNull();
    expect(modeSkill("")).toBeNull();
  });
});

describe("MODE_META — single source of truth for every ActivityMode", () => {
  it("covers every ActivityMode in the content enum", () => {
    for (const mode of ACTIVITY_MODES) {
      const meta = MODE_META[mode];
      expect(meta.mode).toBe(mode);
      expect(meta.skill).toBe(modeSkill(mode));
      expect(meta.isIelts).toBe(mode.startsWith("ielts-"));
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.badgeClass).toContain(`skill-${meta.skill}`);
    }
  });

  it("ielts variants reuse the same skill icon/label/tone (badge only)", () => {
    expect(MODE_META["ielts-writing"].icon).toBe(MODE_META.writing.icon);
    expect(MODE_META["ielts-writing"].badgeClass).toBe(MODE_META.writing.badgeClass);
  });
});

describe("modeMeta — safe lookup with neutral fallback", () => {
  it("returns MODE_META entry for valid modes", () => {
    expect(modeMeta("ielts-listening")).toEqual(MODE_META["ielts-listening"]);
  });

  it("returns slate-neutral meta carrying the raw mode name for unknown modes", () => {
    const meta = modeMeta("khong-ton-tai");
    expect(meta.label).toBe("khong-ton-tai");
    expect(meta.badgeClass).toContain("slate");
    expect(meta.isIelts).toBe(false);
  });
});

describe("isIeltsMode", () => {
  it("detects only the ielts- prefix", () => {
    expect(isIeltsMode("ielts-speaking")).toBe(true);
    expect(isIeltsMode("speaking")).toBe(false);
  });
});
