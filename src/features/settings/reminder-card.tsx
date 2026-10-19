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
    const ok = await onSave(nextEnabled, nextTime);
    if (ok) {
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2500);
    }
  };

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Nhắc nhở học hàng ngày"
        description="Thông báo nhắc nhở 30–45 phút học mỗi ngày (mặc định tắt)"
        action={
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={enabled}
              disabled={saving}
              aria-label="Bật nhắc nhở học hàng ngày"
              onChange={(e) => void save(e.target.checked, time)}
            />
            <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        }
      />

      {enabled && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-700">Giờ nhắc học:</span>
          <input
            type="time"
            value={time}
            disabled={saving}
            aria-label="Giờ nhắc học"
            onChange={(e) => void save(enabled, e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {savedTick && (
        <div className="text-xs font-medium text-emerald-600" role="status">
          ✓ Đã lưu cài đặt nhắc học thành công.
        </div>
      )}
    </Card>
  );
}
