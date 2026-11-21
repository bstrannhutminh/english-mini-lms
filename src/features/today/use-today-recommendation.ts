"use client";

/**
 * useTodayRecommendation — dữ liệu màn Hôm nay.
 * - `initialData` do server render sẵn (page.tsx) → lần vẽ đầu có ngay bài học,
 *   không fetch lặp, không nháy skeleton.
 * - Đổi 30/45 hoặc Thử lại → fetch GET /api/v1/today qua apiFetch +
 *   todayRecommendationSchema. Khi đổi thời lượng, dữ liệu cũ được giữ trên
 *   màn hình (loading = true) cho tới khi có dữ liệu mới.
 * Trả { data, loading, error, targetMinutes, selectTargetMinutes, retry }.
 */
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  todayRecommendationSchema,
  type TodayRecommendationContract,
} from "@/contracts/today";

export interface TodayRecommendationState {
  data: TodayRecommendationContract | null;
  loading: boolean;
  error: string | null;
  targetMinutes: 30 | 45;
  selectTargetMinutes: (mins: 30 | 45) => void;
  retry: () => void;
}

/**
 * Phần thuần của nhánh `initialData` (tách ra để unit test, không cần React):
 * lượt render đầu (requestId = 0) chỉ fetch khi KHÔNG có dữ liệu server;
 * mọi lần đổi 30/45 hay Thử lại (requestId > 0) đều fetch lại.
 */
export function shouldFetchOnMount(requestId: number, hasServerData: boolean): boolean {
  return !(requestId === 0 && hasServerData);
}

export function useTodayRecommendation(
  initialTargetMinutes: 30 | 45,
  initialData: TodayRecommendationContract | null = null
): TodayRecommendationState {
  const [targetMinutes, setTargetMinutes] = useState<30 | 45>(
    initialTargetMinutes
  );
  const [data, setData] = useState<TodayRecommendationContract | null>(initialData);
  const [loading, setLoading] = useState(initialData === null);
  const [error, setError] = useState<string | null>(null);
  // 0 = lượt đầu (đã có dữ liệu server nếu initialData); mỗi lần đổi/thử lại +1.
  const [requestId, setRequestId] = useState(0);
  const hasServerData = initialData !== null;

  useEffect(() => {
    if (!shouldFetchOnMount(requestId, hasServerData)) return;
    let active = true;

    apiFetch(
      `/api/v1/today?target_minutes=${targetMinutes}`,
      undefined,
      todayRecommendationSchema
    )
      .then((json) => {
        if (active) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error("Lỗi tải gợi ý học tập:", err);
        if (active) {
          setData(null);
          setError(
            err instanceof Error
              ? err.message
              : "Đã có lỗi xảy ra khi tải bài học gợi ý."
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [targetMinutes, requestId, hasServerData]);

  const selectTargetMinutes = useCallback(
    (mins: 30 | 45) => {
      if (mins !== targetMinutes) {
        setLoading(true);
        setError(null);
        setTargetMinutes(mins);
        setRequestId((id) => id + 1);
      }
    },
    [targetMinutes]
  );

  const retry = useCallback(() => {
    setLoading(true);
    setData(null);
    setError(null);
    setRequestId((id) => id + 1);
  }, []);

  return { data, loading, error, targetMinutes, selectTargetMinutes, retry };
}
