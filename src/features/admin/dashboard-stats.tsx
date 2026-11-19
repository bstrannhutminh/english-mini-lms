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
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
        {label}
      </p>
      <p className={`text-2xl font-bold ${alert ? "text-red-600" : "text-slate-800"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
