import { NextResponse } from "next/server";
import { withAdmin } from "@/server/http";
import { getAdminDashboardData } from "@/server/admin/service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const data = await getAdminDashboardData();
  return NextResponse.json(data);
});
