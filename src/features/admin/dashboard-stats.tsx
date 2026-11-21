"use client";

/**
 * Lưới thẻ thống kê đầu tab Tổng quan: chi phí Gemini tháng, token,
 * số bài chấm lỗi và nhận xét bị gắn cờ (đỏ khi > 0).
 */
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";

export function DashboardStats({ data }: { data: AdminDashboardDataContract }) {
  const usage = data.usage;
  const totalTokens = usage.totalInputTokens + usage.totalOutputTokens;
  const costVnd = Math.round(usage.totalEstimatedCostUsd * 25400);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label={`Chi phí Gemini (${usage.month})`}
        value={`$${usage.totalEstimatedCostUsd.toFixed(4)}`}
        sub={`≈ ${costVnd.toLocaleString("vi-VN")} đ`}
      />
      <StatCard
        label="Token tháng này"
        value={totalTokens.toLocaleString("vi-VN")}
        sub={`${usage.totalInputTokens.toLocaleString()} in / ${usage.totalOutputTokens.toLocaleString()} out`}
      />
      <StatCard
        label="Bài chấm lỗi"
        value={data.failedAssessments.length}
        alert={data.failedAssessments.length > 0}
        sub="cần chấm lại"
      />
      <StatCard
        label="Nhận xét bị cờ"
        value={data.flaggedFeedback.length}
        alert={data.flaggedFeedback.length > 0}
        sub="cần rà soát"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  alert = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`card-lift space-y-1 rounded-2xl border bg-surface p-4 shadow-card ${
        alert ? "border-red-200" : "border-border"
      }`}
    >
      <p className="text-base font-medium leading-snug text-text-secondary">{label}</p>
      <p
        className={`text-3xl font-semibold tabular-nums tracking-tight ${
          alert ? "text-red-700" : "text-text"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-base text-text-muted">{sub}</p>}
    </div>
  );
}
