"use client";

/** Nhận xét AI bị gắn cờ — item render (tách để dashboard-tab gọn). */
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, useToast } from "@/components/ui";
import type { AdminDashboardDataContract } from "@/contracts/admin-dashboard";
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
      <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm border border-emerald-100">
        ✓ Không có nhận xét nào đang bị gắn cờ.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
      {items.map((item) => {
        const meta = modeMeta(item.activityMode);
        return (
          <div key={item.id} className="p-4 space-y-3 hover:bg-slate-50 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">{item.activityTitle}</span>
                <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
                <Badge tone="warning">Đang xét</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/my-work/${item.submissionId}`}
                  className="text-sm text-blue-600 hover:underline font-medium"
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
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                Trích bài: &quot;{item.submissionBodySnippet}&quot;
              </p>
            )}

            {Array.isArray(item.observations) && (
              <div className="space-y-2">
                {(item.observations as Observation[]).map((obs, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-3 rounded-lg border ${
                      obs.flagged
                        ? "bg-amber-50/70 border-amber-300 text-amber-900"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>
                        {obs.flagged ? "🚩 " : "• "}
                        {obs.location} ({obs.category || "ngữ pháp"})
                      </span>
                      {obs.flagged && (
                        <span className="text-[11px] text-amber-700 font-normal">
                          {obs.flaggedReason || "Người học phản ánh"}
                        </span>
                      )}
                    </div>
                    {obs.original && (
                      <div className="italic text-slate-600 mb-1">&quot;{obs.original}&quot;</div>
                    )}
                    <div>
                      <strong>Góp ý AI:</strong> {obs.issue}
                      {obs.suggestion ? ` → ${obs.suggestion}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              {new Date(item.createdAt).toLocaleString("vi-VN")} ·{" "}
              {item.learnerName || "Người học"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
