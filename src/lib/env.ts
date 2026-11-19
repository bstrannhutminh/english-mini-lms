/**
 * Lazy, zod-validated access to environment variables.
 *
 * IMPORTANT: this module must stay import-safe during `next build` —
 * no top-level validation, no throws at import time. Callers validate at
 * request time via getEnv()/requireEnv(). Missing variables raise EnvError
 * with a Vietnamese message naming every missing variable.
 */
import { z } from "zod";

const envSchema = z.object({
  /** Supabase (public — also inlined into the client bundle). */
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL phải là một URL hợp lệ"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  /** Optional server key; storage/media falls back to the anon key. */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  /** Postgres — DATABASE_URL preferred, POSTGRES_URL accepted as fallback. */
  DATABASE_URL: z.string().min(1).optional(),
  POSTGRES_URL: z.string().min(1).optional(),

  /** Gemini evaluation provider. */
  GEMINI_API_KEY: z.string().min(1).optional(),

  /** Optional Google Drive sync for admin content. */
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().min(1).optional(),

  /** Dev-only auth bypass (never honoured outside NODE_ENV=development). */
  DEV_BYPASS_AUTH: z.enum(["true", "false"]).optional(),
});
export type AppEnv = z.infer<typeof envSchema>;

/** Thrown by getEnv()/requireEnv() when validation fails. */
export class EnvError extends Error {
  /** Names of variables that are missing or invalid. */
  missing: string[];
  constructor(missing: string[], detail?: string) {
    super(
      `Thiếu hoặc sai biến môi trường: ${missing.join(", ")}.` +
        " Vui lòng kiểm tra cấu hình (.env.local / Vercel env)." +
        (detail ? ` Chi tiết: ${detail}` : "")
    );
    this.name = "EnvError";
    this.missing = missing;
  }
}

let cachedFull: AppEnv | null = null;

function validate(): { env: AppEnv | null; missing: string[]; detail?: string } {
  const parsed = envSchema.safeParse(process.env);
  const missing: string[] = [];
  let detail: string | undefined;

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !missing.includes(key)) missing.push(key);
    }
    detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
  }

  const env = (parsed.success ? parsed.data : ({} as AppEnv));
  // DATABASE_URL or POSTGRES_URL — at least one required.
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl || !dbUrl.trim()) {
    if (!missing.includes("DATABASE_URL")) missing.push("DATABASE_URL");
  }
  if (!env.GEMINI_API_KEY && !missing.includes("GEMINI_API_KEY")) {
    missing.push("GEMINI_API_KEY");
  }
  if (missing.length > 0) {
    return { env: null, missing, detail };
  }
  return { env, missing };
}

/**
 * Validate the full runtime env and return it (cached).
 * Throws EnvError — call at request time, never at module top-level.
 */
export function getEnv(): AppEnv {
  if (cachedFull) return cachedFull;
  const { env, missing, detail } = validate();
  if (!env) throw new EnvError(missing, detail);
  cachedFull = env;
  return env;
}

/**
 * Tolerant accessor — returns whatever parses (possibly {} when nothing is
 * set), never throws. For optional features and build-time code paths.
 */
export function getPartialEnv(): Partial<AppEnv> {
  const parsed = envSchema.partial().safeParse(process.env);
  return parsed.success ? parsed.data : {};
}

/**
 * Validate a subset of variables at request time.
 * Throws EnvError naming the missing variables.
 */
export function requireEnv<K extends keyof AppEnv>(keys: K[]): Pick<AppEnv, K> {
  const missing: string[] = [];
  for (const key of keys) {
    const value = process.env[key as string];
    if (!value || !value.trim()) missing.push(key as string);
  }
  if (missing.length > 0) throw new EnvError(missing);
  // Validate the requested keys against the schema (catches e.g. bad URLs)
  // and return just those keys.
  const env = envSchema.partial().parse(process.env);
  const result = {} as Record<string, unknown>;
  for (const key of keys) result[key as string] = env[key];
  return result as Pick<AppEnv, K>;
}
