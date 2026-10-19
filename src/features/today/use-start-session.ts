"use client";

/**
 * useStartSession — khởi tạo phiên học từ hub Hôm nay:
 *  - actionType "continue_draft" → vào thẳng /learn/[sessionId] (1 chạm)
 *  - "start_revision" → tạo phiên rồi mở kèm ?parentId=
 *  - còn lại → POST /api/v1/sessions → /learn/[sessionId]
 * 409 (đã có phiên dở của bài này) → tiếp tục phiên đó. Lỗi → Toast tiếng Việt.
 */
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { createSessionResponseSchema } from "@/contracts/session";
import { useToast } from "@/components/ui";
import type { ActionType } from "@/contracts/today";

/** Tối thiểu để start: id + các cờ hành động tuỳ chọn (alternate thiếu → new_session). */
export interface StartableActivity {
  id: string;
  actionType?: ActionType;
  sessionId?: string;
  parentId?: string;
}

export function useStartSession(targetMinutes: 30 | 45) {
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState(false);

  const startSession = useCallback(
    async (activity: StartableActivity) => {
      setStarting(true);
      // Query ?parentId= khi bắt đầu phiên sửa bài — giữ cả trên nhánh 409.
      const revisionQuery =
        activity.actionType === "start_revision" && activity.parentId
          ? `?parentId=${encodeURIComponent(activity.parentId)}`
          : "";
      try {
        // Nháp dở → tiếp tục phiên cũ luôn, không tạo mới.
        if (activity.actionType === "continue_draft" && activity.sessionId) {
          router.push(`/learn/${activity.sessionId}`);
          return;
        }

        const res = await apiFetch(
          "/api/v1/sessions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityId: activity.id,
              targetMinutes,
            }),
          },
          createSessionResponseSchema
        );
        router.push(`/learn/${res.sessionId}${revisionQuery}`);
      } catch (err) {
        // Đã có phiên active/paused của bài này → tiếp tục thay vì báo lỗi.
        if (
          err instanceof ApiClientError &&
          err.status === 409 &&
          err.sessionId
        ) {
          router.push(`/learn/${err.sessionId}${revisionQuery}`);
          return;
        }
        toast.error(
          "Không thể khởi tạo phiên học",
          err instanceof Error ? err.message : undefined
        );
        setStarting(false);
      }
    },
    [router, targetMinutes, toast]
  );

  return { startSession, starting };
}
