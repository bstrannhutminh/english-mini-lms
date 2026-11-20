"use client";
import { Button, Icon } from "@/components/ui";
export interface TodayErrorCardProps {
  message: string;
  onRetry: () => void;
}
export function TodayErrorCard({ message, onRetry }: TodayErrorCardProps) {
  return <div role="alert" className="space-y-3 rounded-xl border border-danger/30 bg-danger/5 p-5 text-danger">
    <div className="flex items-start gap-3">
      <Icon name="alert-triangle" className="mt-1 h-5 w-5 shrink-0" />
      <div>
        <h2 className="text-lg font-semibold">Chưa tải được bài học hôm nay</h2>
        <p className="mt-2 text-base leading-relaxed">
          {message}
        </p>
      </div>
    </div>
    <Button variant="outline" onClick={onRetry}><Icon name="refresh" className="h-4 w-4" />Thử lại</Button>
  </div>;
}
