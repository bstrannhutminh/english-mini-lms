"use client";

import { useCallback, useState } from "react";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { createSubmissionResponseSchema } from "@/contracts/submission";
import type { SubmissionInput, SubmissionResult } from "../modes/types";

export interface SubmitHook {
  isSubmitting: boolean;
  /** Thông báo lỗi tiếng Việt, null khi không có lỗi. */
  error: string | null;
  setError: (msg: string | null) => void;
  /**
   * Nộp bài → POST /api/v1/sessions/[id]/submissions.
   * submissions append-only; truyền parentId để tạo bản sửa (revision).
   * Trả null khi thất bại (error đã được set).
   */
  submit: (input: SubmissionInput, parentId?: string) => Promise<SubmissionResult | null>;
}

export function useSubmit(sessionId: string): SubmitHook {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (
      input: SubmissionInput,
      parentId?: string,
    ): Promise<SubmissionResult | null> => {
      try {
        setIsSubmitting(true);
        setError(null);
        return await apiFetch(
          `/api/v1/sessions/${sessionId}/submissions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              body: input.body,
              mediaId: input.mediaId,
              parentId: parentId || undefined,
            }),
          },
          createSubmissionResponseSchema,
        );
      } catch (err) {
        console.error("Lỗi nộp bài:", err);
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại.",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId],
  );

  return { isSubmitting, error, setError, submit };
}
