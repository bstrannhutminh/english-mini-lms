import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";

/**
 * Trạng thái ban đầu của tab Tổng quan (hàm thuần, có unit test):
 * server đã render sẵn dữ liệu → hiện ngay, không loading, không gọi API lúc mount;
 * không có → loading và fetch như cũ.
 */
export function initialDashboardState(initial: AdminDashboardDataContract | null | undefined) {
  const hasServerData = initial != null;
  return {
    data: initial ?? null,
    loading: !hasServerData,
    shouldFetchOnMount: !hasServerData,
  };
}
