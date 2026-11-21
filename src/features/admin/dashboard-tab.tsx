"use client";

/**
 * Tab "Tổng quan" — thẻ thống kê AI usage, bài chấm lỗi (retry qua toast),
 * nhận xét bị gắn cờ, phân rã token theo thao tác, và bảng bài học.
 * - Có `initialData` (server render sẵn): hiện ngay, không fetch lúc mount.
 * - Chấm lại / rà soát xong chỉ làm mới ngầm: dữ liệu cũ vẫn ở trên màn hình,
 *   không nhường chỗ cho spinner.
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
import { initialDashboardState } from "./dashboard-state";
import { DashboardStats } from "./dashboard-stats";

const errorText = (err: unknown) => (err instanceof Error ? err.message : "Không tải được dữ liệu.");

export default function DashboardTab({
  initialData = null,
}: {
  initialData?: AdminDashboardDataContract | null;
}) {
  const toast = useToast();
  const [start] = useState(() => initialDashboardState(initialData));
  const [data, setData] = useState<AdminDashboardDataContract | null>(start.data);
  const [loading, setLoading] = useState(start.loading);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Lần đầu chỉ tải khi server chưa cấp dữ liệu — setState chỉ trong callback promise.
  useEffect(() => {
    if (!start.shouldFetchOnMount) return;
    let cancelled = false;
    fetchAdminDashboard()
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [start.shouldFetchOnMount]);

  /** "Thử lại" khi chưa có dữ liệu: quay lại trạng thái đang tải. */
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminDashboard());
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Làm mới ngầm sau chấm lại / rà soát: giữ dữ liệu cũ, lỗi thì báo bằng toast. */
  const refresh = useCallback(async () => {
    try {
      setData(await fetchAdminDashboard());
    } catch (err) {
      toast.error("Chưa làm mới được dữ liệu", errorText(err));
    }
  }, [toast]);

  async function handleRetry(assessmentId: string) {
    setRetryingId(assessmentId);
    try {
      await retryAssessment(assessmentId);
      toast.success("Đã chấm lại thành công");
      await refresh();
    } catch (err) {
      toast.error("Chấm lại thất bại", err instanceof Error ? err.message : "");
    } finally {
      setRetryingId(null);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-12 text-text-secondary">
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
          <Button variant="outline" onClick={reload}>
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
      <Card elevated padded={false} className="p-4 sm:p-5">
        <CardHeader
          title={`Bài nộp lỗi chấm (${data.failedAssessments.length})`}
          description="Lỗi kết nối/timeout khi gọi Gemini — bấm để chấm lại."
        />
        <div className="mt-4">
          {data.failedAssessments.length === 0 ? (
            <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-base text-emerald-800">
              Không có bài chấm lỗi được ghi nhận.
            </p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {data.failedAssessments.map((item) => {
                const meta = modeMeta(item.activityMode);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 p-4 hover:bg-surface-muted sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text">{item.activityTitle}</span>
                        <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
                        <Badge tone="error">Lỗi · lần {item.runVersion}</Badge>
                      </div>
                      {item.submissionBodySnippet && (
                        <p className="max-w-lg truncate text-base italic text-text-secondary">
                          &quot;{item.submissionBodySnippet}&quot;
                        </p>
                      )}
                      <p className="text-base text-text-muted">
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
      <Card elevated padded={false} className="p-4 sm:p-5">
        <CardHeader
          title={`Nhận xét AI bị gắn cờ (${data.flaggedFeedback.length})`}
          description='Nhận xét người học bấm "Tôi không đồng ý" — cần rà lại.'
        />
        <div className="mt-4">
          <FlaggedFeedbackList items={data.flaggedFeedback} onResolved={refresh} />
        </div>
      </Card>

      {/* Phân rã usage */}
      {usage.actionBreakdown.length > 0 && (
        <Card elevated padded={false} className="p-4 sm:p-5">
          <CardHeader title="Token & chi phí theo thao tác" />
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-base text-text-secondary">
              <thead className="border-b border-border bg-surface-muted font-semibold text-text-secondary">
                <tr>
                  <th className="px-3 py-2.5">Thao tác</th>
                  <th className="px-3 py-2.5 text-right">Lượt gọi</th>
                  <th className="px-3 py-2.5 text-right">Input</th>
                  <th className="px-3 py-2.5 text-right">Output</th>
                  <th className="px-3 py-2.5 text-right">Chi phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usage.actionBreakdown.map((row) => (
                  <tr key={row.action} className="hover:bg-surface-muted">
                    <td className="px-3 py-2.5 font-mono font-medium text-text">{row.action}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{row.count}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{row.inputTokens.toLocaleString("vi-VN")}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{row.outputTokens.toLocaleString("vi-VN")}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-emerald-700">
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
