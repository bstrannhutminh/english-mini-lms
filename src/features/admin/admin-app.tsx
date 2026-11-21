"use client";

/**
 * Khung trang admin: tiêu đề + Tabs (Tổng quan / Nội dung học / Drive Sync).
 * Nội dung tab nằm ở các file riêng để file này gọn.
 */
import { useState } from "react";
import { PageContainer } from "@/components/layout";
import { SegmentedControl, Tabs } from "@/components/ui";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import ContentTab from "./content/content-tab";
import DashboardTab from "./dashboard-tab";
import DriveSyncTab from "./drive-sync-tab";

const TABS = [
  { value: "overview", label: "Tổng quan", icon: "home" as const },
  { value: "content", label: "Nội dung học", icon: "book-open" as const },
  { value: "sync", label: "Drive Sync", icon: "refresh" as const },
];

const MOBILE_OPTIONS = [
  { value: "overview", label: <span className="truncate">Tổng quan</span> },
  { value: "content", label: <span className="truncate">Nội dung</span> },
  { value: "sync", label: <span className="truncate">Drive Sync</span> },
];

export default function AdminApp({
  initialDashboard = null,
}: {
  /** Dữ liệu Tổng quan do server render sẵn (null → tab tự tải). */
  initialDashboard?: AdminDashboardDataContract | null;
}) {
  const [tab, setTab] = useState("overview");

  return (
    <PageContainer size="wide" className="space-y-6">
      <header className="border-b border-border pb-5">
        <h1 className="page-title">Quản trị hệ thống</h1>
        <p className="mt-2 text-base text-text-secondary">
          Duyệt nội dung, đồng bộ Drive và xử lý lỗi chấm bài
        </p>
      </header>

      {/* Mobile: 3 nhãn không vừa một hàng dạng tab gạch chân → công tắc chia đều. */}
      <SegmentedControl
        fullWidth
        ariaLabel="Khu vực quản trị"
        className="sm:hidden [&>button]:min-w-0 [&>button]:px-2"
        options={MOBILE_OPTIONS}
        value={tab}
        onChange={setTab}
      />
      <Tabs
        tabs={TABS}
        value={tab}
        onValueChange={setTab}
        aria-label="Khu vực quản trị"
        className="hidden sm:flex"
      />

      {/* Tổng quan luôn được dựng (chỉ ẩn) để giữ dữ liệu mới nhất khi đổi tab. */}
      <div hidden={tab !== "overview"}>
        <DashboardTab initialData={initialDashboard} />
      </div>
      {tab === "content" && <ContentTab />}
      {tab === "sync" && <DriveSyncTab />}
    </PageContainer>
  );
}
