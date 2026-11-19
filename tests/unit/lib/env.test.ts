import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// All app env keys — stubbed to `undefined` (deleted) in beforeEach so tests
// are deterministic regardless of the developer's shell/.env.local.
const APP_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "POSTGRES_URL",
  "GEMINI_API_KEY",
  "GOOGLE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_DRIVE_FOLDER_ID",
  "DEV_BYPASS_AUTH",
] as const;

// Fresh module per test so the cached env doesn't leak between cases.
let env: typeof import("@/lib/env");

beforeEach(async () => {
  vi.resetModules();
  for (const key of APP_ENV_KEYS) vi.stubEnv(key, undefined);
  env = await import("@/lib/env");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getEnv", () => {
  it("throws EnvError naming missing variables in Vietnamese", () => {
    try {
      env.getEnv();
      expect.unreachable();
    } catch (e) {
      const err = e as InstanceType<typeof env.EnvError>;
      expect(err).toBeInstanceOf(env.EnvError);
      expect(err.message).toContain("Thiếu");
      expect(err.missing).toContain("DATABASE_URL");
      expect(err.missing).toContain("GEMINI_API_KEY");
      expect(err.missing).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(err.missing).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
  });

  it("returns typed env when all required vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("DATABASE_URL", "postgres://u:p@h/db");
    vi.stubEnv("GEMINI_API_KEY", "g");
    const e = env.getEnv();
    expect(e.NEXT_PUBLIC_SUPABASE_URL).toBe("https://x.supabase.co");
  });

  it("accepts POSTGRES_URL as the DB fallback", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("POSTGRES_URL", "postgres://u:p@h/db");
    vi.stubEnv("GEMINI_API_KEY", "g");
    expect(() => env.getEnv()).not.toThrow();
  });
});

describe("getPartialEnv", () => {
  it("never throws, even with zero env", () => {
    const partial = env.getPartialEnv();
    expect(typeof partial).toBe("object");
  });
});

describe("requireEnv", () => {
  it("returns only the requested keys", () => {
    vi.stubEnv("GEMINI_API_KEY", "g-key");
    const picked = env.requireEnv(["GEMINI_API_KEY"]);
    expect(picked.GEMINI_API_KEY).toBe("g-key");
  });

  it("throws EnvError naming the missing key", () => {
    expect(() => env.requireEnv(["GEMINI_API_KEY"])).toThrow(/GEMINI_API_KEY/);
  });
});
