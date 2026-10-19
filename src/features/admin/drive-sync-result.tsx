"use client";

/**
 * Thẻ kết quả drive-sync (dry-run / apply): thống kê + danh sách id theo
 * nhóm (thêm/cập nhật/bỏ qua) + xung đột + lỗi/cảnh báo.
 */
import { Card, CardHeader } from "@/components/ui";
import type { SyncDriveResult } from "@/contracts/admin-dashboard";

export function ResultCard({
  result,
  title,
}: {
  result: SyncDriveResult;
  title: string;
}) {
  const errors = result.errors.filter((e) => !e.message.startsWith("[warning]"));
  const warnings = result.errors.filter((e) => e.message.startsWith("[warning]"));
  const quiet =
    result.added.length === 0 &&
    result.updated.length === 0 &&
    result.conflicts.length === 0 &&
    result.errors.length === 0;

  return (
    <Card
      className={result.dryRun ? "border-amber-200" : "border-emerald-200"}
    >
      <CardHeader title={title} />
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Thêm mới" value={result.added.length} tone="emerald" />
        <StatChip label="Cập nhật" value={result.updated.length} tone="indigo" />
        <StatChip
          label="Xung đột"
          value={result.conflicts.length}
          tone={result.conflicts.length > 0 ? "amber" : "slate"}
        />
        <StatChip
          label="Lỗi"
          value={errors.length}
          tone={errors.length > 0 ? "red" : "slate"}
        />
      </div>

      <div className="mt-4 space-y-3">
        <IdList title="Mới thêm" ids={result.added} cls="text-emerald-700 bg-emerald-50 border-emerald-200" />
        <IdList title="Cập nhật" ids={result.updated} cls="text-indigo-700 bg-indigo-50 border-indigo-200" />
        <IdList title="Bỏ qua (chưa duyệt)" ids={result.skipped} cls="text-slate-600 bg-slate-50 border-slate-200" />

        {result.conflicts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-800">
              Xung đột — giữ nguyên bản admin ({result.conflicts.length})
            </p>
            <div className="divide-y divide-amber-100 border border-amber-200 rounded-lg overflow-hidden">
              {result.conflicts.map((c) => (
                <div key={c.id} className="px-3 py-2 bg-amber-50 text-xs text-amber-900">
                  <span className="font-mono font-medium">{c.id}</span>{" "}
                  <span className="text-amber-600">({c.kind})</span> — {c.reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {(errors.length > 0 || warnings.length > 0) && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-800">
              Lỗi ({errors.length})
              {warnings.length > 0 && ` + ${warnings.length} cảnh báo`}
            </p>
            <div className="divide-y divide-red-100 border border-red-200 rounded-lg overflow-hidden">
              {result.errors.map((e, i) => {
                const warn = e.message.startsWith("[warning]");
                return (
                  <div
                    key={i}
                    className={`px-3 py-2 text-xs ${warn ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-900"}`}
                  >
                    {e.id && <span className="font-mono font-medium mr-1">[{e.id}]</span>}
                    {e.file && <span className="font-mono text-slate-500 mr-1">{e.file}:</span>}
                    {warn ? e.message.slice("[warning]".length).trim() : e.message}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {quiet && (
          <p className="text-sm text-slate-500 italic">
            Không có thay đổi nào — Drive và DB đang đồng bộ.
          </p>
        )}
      </div>
    </Card>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "indigo" | "amber" | "red" | "slate";
}) {
  const cls = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
    slate: "bg-slate-50 border-slate-200 text-slate-600",
  }[tone];
  return (
    <div className={`rounded-lg border p-3 text-center space-y-1 ${cls}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-medium leading-tight">{label}</p>
    </div>
  );
}

function IdList({ title, ids, cls }: { title: string; ids: string[]; cls: string }) {
  if (ids.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-700">
        {title} ({ids.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <span key={id} className={`text-[11px] font-mono px-2 py-0.5 rounded border ${cls}`}>
            {id}
          </span>
        ))}
      </div>
    </div>
  );
}
