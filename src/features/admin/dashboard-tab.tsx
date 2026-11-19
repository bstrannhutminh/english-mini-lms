"use client";

/**
 * Tab "Tổng quan" — thẻ thống kê AI usage, bài chấm lỗi (retry qua toast),
 * nhận xét bị gắn cờ, phân rã token theo thao tác, và bảng bài học.
 * Thẻ thống kê & bảng bài học tách ra dashboard-stats / dashboard-activity-table.
 */
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Spinner,
  useToast,
} from "@/components/ui";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import { modeMeta } from "@/lib/modes";
import { fetchAdminDashboard, retryAssessment } from "./admin-api";
import { DashboardActivityTable } from "./dashboard-activity-table";
import { FlaggedFeedbackList } from "./dashboard-flagged";
import { DashboardStats } from "./dashboard-stats";

export default function DashboardTab() {
  const toast = useToast();
  const [data, setData] = useState<AdminDashboardDataContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAdminDashboard());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRetry(assessmentId: string) {
    setRetryingId(assessmentId);
    try {
      await retryAssessment(assessmentId);
      toast.success("Đã chấm lại thành công");
      await load();
    } catch (err) {
      toast.error("Chấm lại thất bại", err instanceof Error ? err.message : "");
    } finally {
      setRetryingId(null);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-12 text-slate-500">
        <Spinner /> Đang tải bảng điều khiển…
      </p>
    );
  }
  if (error || !data) {
    return (
      <EmptyState
        icon="alert-triangle"
        title="Không tải được dữ liệu quản trị"
        description={error ?? undefined}
        action={
          <Button variant="outline" onClick={load}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const usage = data.usage;

  return (
    <div className="space-y-6">
      <DashboardStats data={data} />

      {/* Chấm lỗi */}
      <Card padded={false} className="p-4 sm:p-5">
        <CardHeader
          title={`Bài nộp lỗi chấm (${data.failedAssessments.length})`}
          description="Lỗi kết nối/timeout khi gọi Gemini — bấm để chấm lại."
        />
        <div className="mt-4">
          {data.failedAssessments.length === 0 ? (
            <p className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm border border-emerald-100">
              ✓ Tất cả bài nộp đã chấm xong.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
              {data.failedAssessments.map((item) => {
                const meta = modeMeta(item.activityMode);
                return (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.activityTitle}</span>
                        <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
                        <Badge tone="error">Lỗi · lần {item.runVersion}</Badge>
                      </div>
                      {item.submissionBodySnippet && (
                        <p className="text-xs text-slate-600 italic truncate max-w-lg">
                          &quot;{item.submissionBodySnippet}&quot;
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      loading={retryingId === item.id}
                      onClick={() => handleRetry(item.id)}
                    >
                      Chấm lại
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Nhận xét bị cờ */}
      <Card padded={false} className="p-4 sm:p-5">
        <CardHeader
          title={`Nhận xét AI bị gắn cờ (${data.flaggedFeedback.length})`}
          description='Nhận xét người học bấm "Tôi không đồng ý" — cần rà lại.'
        />
        <div className="mt-4">
          <FlaggedFeedbackList items={data.flaggedFeedback} onResolved={load} />
        </div>
      </Card>

      {/* Phân rã usage */}
      {usage.actionBreakdown.length > 0 && (
        <Card padded={false} className="p-4 sm:p-5">
          <CardHeader title="Token & chi phí theo thao tác" />
          <div className="mt-4 overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                <tr>
                  <th className="py-2.5 px-3">Thao tác</th>
                  <th className="py-2.5 px-3 text-right">Lượt gọi</th>
                  <th className="py-2.5 px-3 text-right">Input</th>
                  <th className="py-2.5 px-3 text-right">Output</th>
                  <th className="py-2.5 px-3 text-right">Chi phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usage.actionBreakdown.map((row) => (
                  <tr key={row.action} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{row.action}</td>
                    <td className="py-2.5 px-3 text-right">{row.count}</td>
                    <td className="py-2.5 px-3 text-right">{row.inputTokens.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">{row.outputTokens.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                      ${row.estimatedCostUsd.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Danh sách bài — tách sang dashboard-activity-table (có bộ lọc riêng) */}
      <DashboardActivityTable activities={data.activities} />
    </div>
  );
}
