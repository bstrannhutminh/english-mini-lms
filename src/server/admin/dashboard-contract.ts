import { adminDashboardDataSchema, type AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import type { AdminDashboardData } from "./service";

/**
 * Đổi dữ liệu dashboard của server (Date) sang đúng contract /api/v1/admin/dashboard
 * (chuỗi ISO) để trang /admin render sẵn dữ liệu đầu mà client dùng y như
 * kết quả API. Parse lại bằng schema nên lệch contract sẽ lộ ngay ở server.
 */
export function toAdminDashboardContract(data: AdminDashboardData): AdminDashboardDataContract {
  return adminDashboardDataSchema.parse({
    ...data,
    activities: data.activities.map((a) => ({ ...a, updatedAt: a.updatedAt.toISOString() })),
    failedAssessments: data.failedAssessments.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() })),
    flaggedFeedback: data.flaggedFeedback.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() })),
  });
}
