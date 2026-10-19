"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  settingsResponseSchema,
  type LearnerProfile,
  type SettingsSubmission,
} from "@/contracts/settings";

interface SettingsData {
  profile: LearnerProfile | null;
  submissions: SettingsSubmission[];
}

interface UseSettingsData extends SettingsData {
  loading: boolean;
  error: string | null;
  /** Trạng thái nhắc học — hydrate từ profile.preferences khi tải xong. */
  remindEnabled: boolean;
  remindTime: string;
  setReminders: (enabled: boolean, time: string) => void;
  reload: () => void;
  /** Gỡ bài khỏi list sau khi xoá mềm thành công. */
  removeSubmission: (id: string) => void;
}

/** Tải GET /api/v1/settings qua contract — hồ sơ + bài nộp gần đây. */
export function useSettingsData(): UseSettingsData {
  const [data, setData] = useState<SettingsData>({
    profile: null,
    submissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [remindEnabled, setRemindEnabled] = useState(false);
  const [remindTime, setRemindTime] = useState("20:00");

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch("/api/v1/settings", undefined, settingsResponseSchema)
      .then((res) => {
        if (!active) return;
        setData({ profile: res.learner, submissions: res.submissions });
        // Hydrate nhắc học trong callback fetch (external system) — không
        // setState trong thân effect (react-hooks/set-state-in-effect).
        setRemindEnabled(Boolean(res.learner?.preferences?.remindEnabled));
        const t = res.learner?.preferences?.remindTime;
        if (typeof t === "string" && t) setRemindTime(t);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Lỗi khi tải thông tin cài đặt."
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tick]);

  const setReminders = useCallback((enabled: boolean, time: string) => {
    setRemindEnabled(enabled);
    setRemindTime(time);
  }, []);

  const removeSubmission = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      submissions: prev.submissions.filter((s) => s.id !== id),
    }));
  }, []);

  return {
    ...data,
    loading,
    error,
    remindEnabled,
    remindTime,
    setReminders,
    reload,
    removeSubmission,
  };
}
