"use client";

/**
 * useTodayRecommendation — fetch GET /api/v1/today qua apiFetch +
 * todayRecommendationSchema (contract khóa wire shape camelCase).
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

export function useTodayRecommendation(
  initialTargetMinutes: 30 | 45
): TodayRecommendationState {
  const [targetMinutes, setTargetMinutes] = useState<30 | 45>(
    initialTargetMinutes
  );
  const [data, setData] = useState<TodayRecommendationContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
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
  }, [targetMinutes, reloadTick]);

  const selectTargetMinutes = useCallback(
    (mins: 30 | 45) => {
      if (mins !== targetMinutes) {
        setLoading(true);
        setError(null);
        setTargetMinutes(mins);
      }
    },
    [targetMinutes]
  );

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((c) => c + 1);
  }, []);

  return { data, loading, error, targetMinutes, selectTargetMinutes, retry };
}
