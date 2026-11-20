"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { createSessionResponseSchema, type TargetMinutes } from "@/contracts/session";
export function StartSessionCta({ activityId, parentId }: {
  activityId: string;
  parentId?: string;
}) {
  const router = useRouter();
  const [targetMinutes, setTargetMinutes] = useState<TargetMinutes>(30);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const revisionQuery = parentId ? `?parentId=${encodeURIComponent(parentId)}` : "";
  async function handleStart() {
    if (starting)
      return;
    setStarting(true);
    setError(null);
    setExistingSessionId(null);
    try {
      const data = await apiFetch("/api/v1/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityId, targetMinutes }) }, createSessionResponseSchema);
      router.push(`/learn/${data.sessionId}${revisionQuery}`);
    }
    catch (err) {
      if (err instanceof ApiClientError && err.status === 409 && err.sessionId) {
        router.push(`/learn/${err.sessionId}${revisionQuery}`);
        return;
      }
      setError(err instanceof ApiClientError ? err.message : "Chưa thể mở bài học. Vui lòng thử lại.");
      if (err instanceof ApiClientError && err.sessionId)
        setExistingSessionId(err.sessionId);
      setStarting(false);
    }
  }
  return (<div className="mt-5 space-y-3">

    {error && <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-base text-danger">
      <p>
        {error}
      </p>
      {existingSessionId && <button type="button" onClick={() => router.push(`/learn/${existingSessionId}${revisionQuery}`)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-base font-medium underline underline-offset-2">Tiếp tục phiên đang dở<Icon name="arrow-right" className="h-4 w-4" /></button>}
    </div>}

    <div role="group" aria-label="Thời lượng buổi học" className="flex gap-2">
        {([30, 45] as const).map((minutes) => <Button key={minutes} variant="outline" aria-pressed={targetMinutes === minutes} disabled={starting} onClick={() => setTargetMinutes(minutes)} className={cn("flex-1", targetMinutes === minutes && "border-primary bg-surface-muted text-primary-dark")}>{minutes} phút</Button>)}
    </div>

    <Button size="lg" fullWidth loading={starting} onClick={() => void handleStart()}>
      {starting ? "Đang mở bài…" : parentId ? "Bắt đầu bản sửa" : "Bắt đầu học"}
    </Button>

  </div>);
}
