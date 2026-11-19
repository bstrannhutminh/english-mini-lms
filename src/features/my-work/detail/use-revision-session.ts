"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  createSessionRequestSchema,
  createSessionResponseSchema,
} from "@/contracts/session";

/**
 * "Sửa ngay" — tạo phiên học mới cho cùng activity rồi điều hướng
 * /learn/[sessionId]?parentId=<submissionId>. Bản sửa là submission MỚI
 * (append-only qua parentId) — không bao giờ UPDATE bài cũ.
 * 409 = đã có phiên mở cho activity này → tiếp tục phiên đó với parentId.
 */
export function useRevisionSession(activityId: string, submissionId: string) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRevision = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    setError(null);
    try {
      const body = createSessionRequestSchema.parse({
        activityId,
        targetMinutes: 30,
      });
      const { sessionId } = await apiFetch(
        "/api/v1/sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        createSessionResponseSchema
      );
      router.push(`/learn/${sessionId}?parentId=${submissionId}`);
    } catch (err) {
      // Đã có phiên đang mở → mở lại phiên đó làm bản sửa
      if (err instanceof ApiClientError && err.status === 409 && err.sessionId) {
        router.push(`/learn/${err.sessionId}?parentId=${submissionId}`);
        return;
      }
      setError(
        err instanceof Error ? err.message : "Không thể tạo phiên sửa bài"
      );
      setIsCreating(false);
    }
  }, [activityId, submissionId, isCreating, router]);

  return { startRevision, isCreating, error };
}
