"use client";

/**
 * Khung trang admin: tiêu đề + Tabs (Tổng quan / Nội dung học / Drive Sync).
 * Nội dung tab nằm ở các file riêng để file này gọn.
 */
import { useState } from "react";
import { PageContainer } from "@/components/layout";
import { Tabs } from "@/components/ui";
import ContentTab from "./content/content-tab";
import DashboardTab from "./dashboard-tab";
import DriveSyncTab from "./drive-sync-tab";

const TABS = [
  { value: "overview", label: "Tổng quan", icon: "home" as const },
  { value: "content", label: "Nội dung học", icon: "book-open" as const },
  { value: "sync", label: "Drive Sync", icon: "refresh" as const },
];

export default function AdminApp() {
  const [tab, setTab] = useState("overview");

  return (
    <PageContainer size="wide" className="space-y-6">
      <header className="border-b border-border pb-5">
        <h1 className="page-title">Quản trị hệ thống</h1>
        <p className="mt-2 text-base text-text-secondary">
          Duyệt nội dung, đồng bộ Drive và xử lý lỗi chấm bài
        </p>
      </header>

      <Tabs
        tabs={TABS}
        value={tab}
        onValueChange={setTab}
        aria-label="Khu vực quản trị"
      />

      {tab === "overview" && <DashboardTab />}
      {tab === "content" && <ContentTab />}
      {tab === "sync" && <DriveSyncTab />}
    </PageContainer>
  );
}
