/**
 * INVARIANT — ranh giới server→client của màn Học (RSC boundary):
 *  1. page.tsx (Server Component) KHÔNG truyền `plugin={...}` (object chứa
 *     hàm/component → "Functions cannot be passed to Client Components").
 *     Phải truyền `skill` (string) qua SessionRoot.
 *  2. SessionRoot là client component ("use client") và tự tra PLUGIN_SHELLS
 *     (map skill → dynamic import chunk riêng từng skill).
 *  3. PLUGIN_SHELLS đủ 4 skill; MODE_REGISTRY vẫn đủ 4 plugin contract.
 *  4. useOnlineStatus dùng useSyncExternalStore với server snapshot `true`
 *     (navigator.onLine không tồn tại trên Node → đọc lúc SSR gây hydration
 *     mismatch, đã xảy ra một lần — xem refactor-report).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MODE_REGISTRY } from "@/features/session/modes/registry";

const pageSrc = readFileSync(
  path.resolve(process.cwd(), "src/app/(main)/learn/[sessionId]/page.tsx"),
  "utf8"
);
const rootSrc = readFileSync(
  path.resolve(process.cwd(), "src/features/session/shell/session-root.tsx"),
  "utf8"
);
const onlineSrc = readFileSync(
  path.resolve(process.cwd(), "src/features/session/hooks/use-online-status.ts"),
  "utf8"
);

describe("RSC boundary — page.tsx chỉ truyền dữ liệu thuần", () => {
  it("page.tsx render SessionRoot với prop `skill`, không truyền `plugin`", () => {
    expect(pageSrc).toContain("<SessionRoot");
    expect(pageSrc).toMatch(/skill=\{skill\}/);
    expect(pageSrc).not.toMatch(/plugin=\{/);
    expect(pageSrc).not.toContain("<SessionShell");
    // page.tsx không được static import registry (kéo cả 4 plugin vào bundle)
    expect(pageSrc).not.toContain("modes/registry");
  });

  it("session-root.tsx là client component, dynamic import từng skill", () => {
    expect(rootSrc.trimStart().startsWith('"use client"')).toBe(true);
    expect(rootSrc).toContain("PLUGIN_SHELLS[skill]");
    expect(rootSrc).not.toContain("plugin={resolved");
    // Không static import registry/plugins — chunk phải tách theo skill
    expect(rootSrc).not.toContain("modes/registry");
    expect(rootSrc).toContain('import("../modes/writing/plugin-shell")');
    expect(rootSrc).toContain('import("../modes/reading/plugin-shell")');
    expect(rootSrc).toContain('import("../modes/speaking/plugin-shell")');
    expect(rootSrc).toContain('import("../modes/listening/plugin-shell")');
  });

  it("MODE_REGISTRY đủ 4 skill — SessionRoot không render null", () => {
    expect(Object.keys(MODE_REGISTRY).sort()).toEqual([
      "listening",
      "reading",
      "speaking",
      "writing",
    ]);
  });
});

describe("useOnlineStatus — server snapshot an toàn cho SSR/hydration", () => {
  it("dùng useSyncExternalStore, không đọc navigator.onLine ở useState init", () => {
    expect(onlineSrc).toContain("useSyncExternalStore");
    expect(onlineSrc).not.toContain("useState");
  });

  it("getServerSnapshot trả true — không leak navigator vào HTML", () => {
    expect(onlineSrc).toMatch(/\)\s*=>\s*true[,\s)]/);
  });
});
