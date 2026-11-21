"use client";

/** Nhận xét AI bị gắn cờ — item render (tách để dashboard-tab gọn). */
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, useToast } from "@/components/ui";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
import { feedbackCategoryLabel } from "@/lib/feedback-labels";
import { modeMeta } from "@/lib/modes";
import { resolveFeedback } from "./admin-api";

type FlaggedItem = AdminDashboardDataContract["flaggedFeedback"][number];

interface Observation {
  location?: string;
  category?: string;
  issue?: string;
  suggestion?: string;
  original?: string;
  flagged?: boolean;
  flaggedReason?: string;
}

export function FlaggedFeedbackList({
  items,
  onResolved,
}: {
  items: FlaggedItem[];
  onResolved: () => void;
}) {
  const toast = useToast();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function handleResolve(id: string) {
    setResolvingId(id);
    try {
      await resolveFeedback(id);
      toast.success("Đã rà soát nhận xét");
      onResolved();
    } catch (err) {
      toast.error("Rà soát thất bại", err instanceof Error ? err.message : "");
    } finally {
      setResolvingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-base text-emerald-800">
        ✓ Không có nhận xét nào đang bị gắn cờ.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map((item) => {
        const meta = modeMeta(item.activityMode);
        return (
          <div key={item.id} className="space-y-3 p-4 transition hover:bg-surface-muted">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-text">{item.activityTitle}</span>
                <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
                <Badge tone="warning">Đang xét</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/my-work/${item.submissionId}`}
                  className="inline-flex min-h-11 items-center text-base font-medium text-primary-dark hover:underline"
                >
                  Xem bài nộp ↗
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  loading={resolvingId === item.id}
                  onClick={() => handleResolve(item.id)}
                >
                  Đã rà soát
                </Button>
              </div>
            </div>

            {item.submissionBodySnippet && (
              <p className="rounded-xl border border-border bg-surface-muted p-3 text-base italic text-text-secondary">
                Trích bài: &quot;{item.submissionBodySnippet}&quot;
              </p>
            )}

            {Array.isArray(item.observations) && (
              <div className="space-y-2">
                {(item.observations as Observation[]).map((obs, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 text-base ${
                      obs.flagged
                        ? "border-amber-300 bg-amber-50/70 text-amber-900"
                        : "border-border bg-surface text-text-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>
                        {obs.flagged ? "🚩 " : "• "}
                        {obs.location} ({feedbackCategoryLabel(obs.category)})
                      </span>
                      {obs.flagged && (
                        <span className="text-base text-amber-700 font-normal">
                          {obs.flaggedReason || "Người học phản ánh"}
                        </span>
                      )}
                    </div>
                    {obs.original && (
                      <div className="mb-1 italic text-text-secondary">&quot;{obs.original}&quot;</div>
                    )}
                    <div>
                      <strong>Góp ý AI:</strong> {obs.issue}
                      {obs.suggestion ? ` → ${obs.suggestion}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-base text-text-muted">
              {new Date(item.createdAt).toLocaleString("vi-VN")} ·{" "}
              {item.learnerName || "Người học"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
