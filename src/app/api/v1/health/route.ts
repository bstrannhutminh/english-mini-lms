import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/health — liveness công khai, TỐI GIẢN theo D-7/§4.11.
 * Không trả env/DB/host/user/counts — thông tin đó chỉ ở /api/v1/admin/health
 * (đã xác thực role=admin).
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
