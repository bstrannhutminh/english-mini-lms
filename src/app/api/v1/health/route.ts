import { NextResponse } from "next/server";
import { db } from "@/db";
import { learners } from "@/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const envCheck = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlMasked: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@")
      : null,
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV,
  };

  let dbStatus = "unknown";
  let dbError: Record<string, unknown> | null = null;
  let learnerCount = 0;

  try {
    const res = await db.select({ value: count() }).from(learners);
    dbStatus = "connected";
    learnerCount = res[0]?.value ?? 0;
  } catch (err: unknown) {
    dbStatus = "error";
    if (err instanceof Error) {
      dbError = {
        message: err.message,
        code: (err as unknown as Record<string, unknown>).code,
        name: err.name,
      };
    } else {
      dbError = { raw: String(err) };
    }
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    env: envCheck,
    db: {
      status: dbStatus,
      learnerCount,
      error: dbError,
    },
  });
}
