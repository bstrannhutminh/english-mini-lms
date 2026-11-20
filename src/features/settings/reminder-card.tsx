"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui";

interface ReminderCardProps {
  enabled: boolean;
  time: string;
  saving: boolean;
  /** Lưu ngay khi đổi; parent báo toast khi lỗi. Trả true nếu lưu OK. */
  onSave: (enabled: boolean, time: string) => Promise<boolean>;
}

/** Nhắc nhở học hàng ngày: toggle bật/tắt + giờ nhắc (HH:mm). */
export function ReminderCard({ enabled, time, saving, onSave }: ReminderCardProps) {
  const [savedTick, setSavedTick] = useState(false);

  const save = async (nextEnabled: boolean, nextTime: string) => {
    setSavedTick(false);
    const ok = await onSave(nextEnabled, nextTime);
    if (ok) {
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2500);
    }
  };

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Giờ học hằng ngày"
        description="Lưu một giờ học phù hợp vào hồ sơ để duy trì nhịp học mỗi ngày."
        action={
          <label className="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={enabled}
              disabled={saving}
              aria-label="Dùng giờ học cố định"
              onChange={(e) => void save(e.target.checked, time)}
            />
            <div className="relative h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        }
      />

      {enabled && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-base text-text-secondary">Giờ học:</span>
          <input
            type="time"
            value={time}
            disabled={saving}
            aria-label="Giờ học hằng ngày"
            onChange={(e) => void save(enabled, e.target.value)}
            className="min-h-11 rounded-lg border border-border-strong px-2.5 py-1 text-base focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {savedTick && (
        <div className="text-base font-medium text-emerald-600" role="status">
          ✓ Đã lưu giờ học vào hồ sơ.
        </div>
      )}
    </Card>
  );
}
