"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  createSessionResponseSchema,
  type TargetMinutes,
} from "@/contracts/session";

/**
 * CTA "Bắt đầu 30'/45'" trên trang chi tiết bài — tạo phiên qua
 * POST /api/v1/sessions (cùng contract với /today), rồi vào /learn/[sessionId].
 * 409 = đã có phiên dở của bài này → chuyển tiếp tục phiên đó.
 */
export function StartSessionCta({
  activityId,
  parentId,
}: {
  activityId: string;
  /** Submission Bản 1 — khi "làm Bản 2" (gợi ý start_revision từ Thư viện). */
  parentId?: string;
}) {
  const router = useRouter();
  const [loadingMinutes, setLoadingMinutes] = useState<TargetMinutes | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(
    null
  );

  // ?parentId= kèm khi vào /learn — cùng call shape với today-view.
  const revisionQuery = parentId
    ? `?parentId=${encodeURIComponent(parentId)}`
    : "";

  async function handleStart(minutes: TargetMinutes) {
    setLoadingMinutes(minutes);
    setError(null);
    setExistingSessionId(null);
    try {
      const data = await apiFetch(
        "/api/v1/sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityId,
            targetMinutes: minutes,
          }),
        },
        createSessionResponseSchema
      );
      router.push(`/learn/${data.sessionId}${revisionQuery}`);
    } catch (err) {
      // Phiên đang dở của bài này → tiếp tục ngay (cùng luồng /today).
      if (
        err instanceof ApiClientError &&
        err.status === 409 &&
        err.sessionId
      ) {
        router.push(`/learn/${err.sessionId}${revisionQuery}`);
        return;
      }
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
      if (err instanceof ApiClientError && err.sessionId) {
        setExistingSessionId(err.sessionId);
      }
      setLoadingMinutes(null);
    }
  }

  return (
    <div className="mt-6">
      {error ? (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <Icon
            name="alert-triangle"
            className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0">{error}</p>
            {existingSessionId ? (
              <button
                type="button"
                onClick={() => router.push(`/learn/${existingSessionId}`)}
                className="m-0 mt-1.5 inline-flex min-h-11 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-semibold text-red-800 underline underline-offset-2"
              >
                Tiếp tục phiên đang dở
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          variant="primary"
          loading={loadingMinutes === 30}
          disabled={loadingMinutes !== null}
          onClick={() => handleStart(30)}
          className="flex-col gap-0.5 py-3"
        >
          <span className="text-base font-semibold">Bắt đầu 30 phút</span>
          <span className="text-xs font-normal opacity-85">
            Tiêu chuẩn mỗi ngày
          </span>
        </Button>
        <Button
          size="lg"
          variant="secondary"
          loading={loadingMinutes === 45}
          disabled={loadingMinutes !== null}
          onClick={() => handleStart(45)}
          className="flex-col gap-0.5 py-3"
        >
          <span className="text-base font-semibold">Bắt đầu 45 phút</span>
          <span className="text-xs font-normal opacity-85">
            Chuyên sâu / sửa bài
          </span>
        </Button>
      </div>
    </div>
  );
}
