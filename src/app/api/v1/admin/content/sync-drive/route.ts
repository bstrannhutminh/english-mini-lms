import { NextResponse } from "next/server";
import { parseJson, withAdmin } from "@/server/http";
import { syncDriveContent } from "@/server/admin/drive-sync";
import { syncDriveRequestSchema } from "@/contracts/admin-dashboard";

export const dynamic = "force-dynamic";
// Drive API có thể chậm — tăng timeout lên 60s
export const maxDuration = 60;

/**
 * POST /api/v1/admin/content/sync-drive
 * Body: { dryRun?: boolean } — mặc định TRUE (dry-run an toàn trước khi ghi).
 * Response: SyncResult
 */
export const POST = withAdmin(async ({ req }) => {
  const body = await parseJson(req, syncDriveRequestSchema);
  const result = await syncDriveContent({ dryRun: body.dryRun ?? true });
  return NextResponse.json(result);
});
