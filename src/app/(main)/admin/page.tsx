import { getCurrentLearner } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { EmptyState } from "@/components/ui";
import AdminApp from "@/features/admin/admin-app";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import { getAdminDashboardData } from "@/server/admin/service";
import { toAdminDashboardContract } from "@/server/admin/dashboard-contract";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản trị hệ thống — English Mini LMS",
};

export default async function AdminPage() {
  const learner = await getCurrentLearner();
  if (!learner) {
    redirect("/login");
  }

  if (learner.role !== "admin") {
    return (
      <PageContainer size="narrow" className="py-16">
        <EmptyState
          icon="shield"
          title="Quyền truy cập bị giới hạn"
          description="Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập trang này."
          className="rounded-2xl border border-border bg-surface shadow-card"
          action={
            <Link
              href="/today"
              className="pressable inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-base font-semibold text-white no-underline shadow-card hover:bg-primary-dark"
            >
              Quay lại Hôm nay
            </Link>
          }
        />
      </PageContainer>
    );
  }

  // Render sẵn tab Tổng quan ở server → không nháy khung chờ, bớt một lượt gọi API.
  // Lỗi ở đây không chặn trang: client tự gọi /api/v1/admin/dashboard và hiện nút Thử lại.
  let initialDashboard: AdminDashboardDataContract | null = null;
  try {
    initialDashboard = toAdminDashboardContract(await getAdminDashboardData());
  } catch (error) {
    console.error("AdminPage: getAdminDashboardData failed:", error);
  }

  return <AdminApp initialDashboard={initialDashboard} />;
}
