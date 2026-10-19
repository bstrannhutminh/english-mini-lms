import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { withAdmin } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/health — chẩn đoán chi tiết, CHỈ admin (withAdmin).
 *
 * Bảo mật (§4.11): trả cờ boolean "có/không có" cho từng biến môi trường —
 * TUYỆT ĐỐI không trả giá trị, host, user, chuỗi kết nối đã mask, hay số
 * lượng learner. Lỗi DB chỉ trả loại lỗi (không kèm message gốc có thể lộ
 * host/user trong connection string).
 */
export const GET = withAdmin(async () => {
  /** Cờ hiện diện env — boolean, không giá trị. */
  const env = {
    databaseUrl: Boolean(
      process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim()
    ),
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    geminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    googleServiceAccount: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    googleDriveFolder: Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID),
    nodeEnv: process.env.NODE_ENV ?? "unknown",
  };

  // Ping DB — SELECT 1, không đọc bảng nghiệp vụ.
  let dbStatus: "connected" | "error" = "error";
  let dbErrorKind: string | null = null;
  try {
    await db.execute(sql`select 1`);
    dbStatus = "connected";
  } catch (err) {
    // Chỉ lộ loại lỗi (timeout/connection/...), không message gốc.
    dbErrorKind = err instanceof Error ? err.name : "unknown";
  }

  // Phiên bản migration mới nhất — bảng drizzle.__drizzle_migrations.
  // Best-effort: thiếu bảng (chưa migrate lần nào) → "unknown".
  let migration: { applied: number | null; latestAt: string | null } = {
    applied: null,
    latestAt: null,
  };
  if (dbStatus === "connected") {
    try {
      const rows = await db.execute(
        sql`select count(*)::int as applied, max(created_at) as latest
            from drizzle.__drizzle_migrations`
      );
      const row = (rows as unknown as Array<{
        applied: number;
        latest: string | number | null;
      }>)[0];
      if (row) {
        migration = {
          applied: row.applied,
          // created_at là bigint (epoch ms) trong __drizzle_migrations.
          latestAt:
            row.latest != null
              ? new Date(Number(row.latest)).toISOString()
              : null,
        };
      }
    } catch {
      // Bảng migration chưa tồn tại → giữ null.
    }
  }

  return NextResponse.json(
    {
      status: dbStatus === "connected" ? "healthy" : "unhealthy",
      time: new Date().toISOString(),
      env,
      db: { status: dbStatus, errorKind: dbErrorKind },
      migrations: migration,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});
