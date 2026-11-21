import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  submissionListResponseSchema,
  type SubmissionListItem,
} from "@/contracts/submission";

/**
 * Danh sách bài nộp cho /my-work.
 * - Có `initialData` (server đã render sẵn): không có trạng thái tải, không
 *   fetch trùng lần đầu; dữ liệu mới từ server (điều hướng lại/refresh) tự chảy
 *   xuống qua prop cho tới khi client tự tải lại.
 * - Không có `initialData` (server lỗi/không truyền): hành vi cũ — fetch khi mount.
 * "Thử lại"/`refresh` luôn gọi GET /api/v1/submissions.
 */

/**
 * Phần thuần của nhánh `initialData` (tách ra để unit test, không cần React):
 * có dữ liệu server → không loading/fetch lúc mount; `fetched` (client tự tải)
 * luôn thắng `initialData` sau lần refresh/thử lại đầu tiên.
 */
export function resolveSubmissionList(
  fetched: SubmissionListItem[] | null,
  initialData?: SubmissionListItem[]
): { submissions: SubmissionListItem[]; hasServerData: boolean } {
  return {
    submissions: fetched ?? initialData ?? [],
    hasServerData: initialData !== undefined,
  };
}

export function useSubmissionList(initialData?: SubmissionListItem[]) {
  const { hasServerData: hasInitialData } = resolveSubmissionList(null, initialData);
  /** Kết quả client tự tải (ghi đè initialData sau khi refresh/thử lại). */
  const [fetched, setFetched] = useState<SubmissionListItem[] | null>(null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(
    () =>
      apiFetch("/api/v1/submissions", undefined, submissionListResponseSchema),
    []
  );

  // Fetch khi mount CHỈ khi server chưa cấp dữ liệu — setState chỉ trong
  // callback promise (rule react-hooks).
  useEffect(() => {
    if (hasInitialData) return;
    let cancelled = false;
    fetchList()
      .then((data) => {
        if (!cancelled) {
          setFetched(data.submissions);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchList, hasInitialData]);

  // "Thử lại" / làm mới — setState trong event handler được phép.
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchList()
      .then((data) => {
        setFetched(data.submissions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        setLoading(false);
      });
  };

  const { submissions } = resolveSubmissionList(fetched, initialData);

  return { submissions, loading, error, handleRetry, refresh: handleRetry };
}
