import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  submissionListResponseSchema,
  type SubmissionListItem,
} from "@/contracts/submission";

/** Load submissions with mount cancellation and an explicit retry action. */
export function useSubmissionList() {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(
    () =>
      apiFetch("/api/v1/submissions", undefined, submissionListResponseSchema),
    []
  );

  // Fetch khi mount — setState chỉ trong callback promise (rule react-hooks).
  useEffect(() => {
    let cancelled = false;
    fetchList()
      .then((data) => {
        if (!cancelled) {
          setSubmissions(data.submissions);
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
  }, [fetchList]);

  // "Thử lại" — setState trong event handler được phép.
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchList()
      .then((data) => {
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        setLoading(false);
      });
  };

  return { submissions, loading, error, handleRetry };
}
