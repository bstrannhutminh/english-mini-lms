"use client";

/**
 * Bảng danh sách admin — mọi nhãn tiếng Việt:
 * mode → MODE_META.shortLabel (+ badge IELTS), reviewState → StateBadge.
 */
import type { ReactNode } from "react";
import { Badge, Button } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import { getTopicMeta } from "@/lib/topics";
import type {
  AdminActivity,
  AdminSegment,
  AdminSource,
} from "@/contracts/admin-content";
import { StateBadge } from "../state-badge";

const th = "py-2.5 px-3 whitespace-nowrap";
const td = "py-2 px-3 align-top";

function ModeChip({ mode }: { mode: string }) {
  const meta = modeMeta(mode);
  return (
    <span className="inline-flex items-center gap-1">
      <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
      {meta.isIelts && <Badge tone="neutral">IELTS</Badge>}
    </span>
  );
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider border-b">
          <tr>
            {head.map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

const editBtnProps = { variant: "outline", size: "sm" } as const;

export function ActivitiesTable({
  rows,
  onEdit,
}: {
  rows: AdminActivity[];
  onEdit: (a: AdminActivity) => void;
}) {
  return (
    <Table head={["Mã", "Tiêu đề", "Kỹ năng", "Chủ đề", "Trạng thái", ""]}>
      {rows.length === 0 && (
        <tr>
          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
            Không có bài nào.
          </td>
        </tr>
      )}
      {rows.map((a) => {
        const topic = getTopicMeta(a.topic);
        return (
          <tr key={a.id} className="hover:bg-slate-50/50">
            <td className={`${td} font-mono text-xs text-slate-500`}>{a.id}</td>
            <td className={`${td} font-medium text-slate-800 min-w-[160px]`}>
              {a.title}
              {a.origin === "admin" && (
                <span className="ml-1 text-[10px] text-slate-400">· tạo tay</span>
              )}
            </td>
            <td className={td}>
              <ModeChip mode={a.mode} />
            </td>
            <td className={`${td} whitespace-nowrap`}>
              {topic.icon} {topic.name}
            </td>
            <td className={td}>
              <StateBadge state={a.reviewState} />
            </td>
            <td className={td}>
              <Button
                {...editBtnProps}
                aria-label={`Sửa bài ${a.id}`}
                onClick={() => onEdit(a)}
              >
                Sửa
              </Button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export function SourcesTable({
  rows,
  onEdit,
}: {
  rows: AdminSource[];
  onEdit: (s: AdminSource) => void;
}) {
  return (
    <Table head={["Mã", "Tiêu đề", "Loại", "URL", "Trạng thái", ""]}>
      {rows.map((s) => (
        <tr key={s.id} className="hover:bg-slate-50/50">
          <td className={`${td} font-mono text-xs text-slate-500`}>{s.id}</td>
          <td className={`${td} font-medium text-slate-800 min-w-[140px]`}>
            {s.title}
          </td>
          <td className={td}>{s.kind}</td>
          <td className={`${td} max-w-[160px] truncate text-xs`}>
            {s.url ?? "—"}
          </td>
          <td className={td}>
            <StateBadge state={s.reviewState} />
          </td>
          <td className={td}>
            <Button
              {...editBtnProps}
              aria-label={`Sửa nguồn ${s.id}`}
              onClick={() => onEdit(s)}
            >
              Sửa
            </Button>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export function SegmentsTable({
  rows,
  onEdit,
}: {
  rows: AdminSegment[];
  onEdit: (s: AdminSegment) => void;
}) {
  return (
    <Table head={["Mã", "Nguồn", "Vị trí", "Nội dung", ""]}>
      {rows.map((s) => (
        <tr key={s.id} className="hover:bg-slate-50/50">
          <td className={`${td} font-mono text-xs text-slate-500`}>{s.id}</td>
          <td className={`${td} font-mono text-xs`}>{s.sourceId}</td>
          <td className={`${td} whitespace-nowrap`}>
            {s.page != null
              ? `tr.${s.page}`
              : s.startSeconds != null
                ? `${s.startSeconds}–${s.endSeconds ?? "?"}s`
                : "—"}
          </td>
          <td className={`${td} text-xs`}>
            {[
              s.textContent ? "text" : "",
              s.transcriptContent ? "transcript" : "",
            ]
              .filter(Boolean)
              .join(" + ") || "trống"}
          </td>
          <td className={td}>
            <Button
              {...editBtnProps}
              aria-label={`Sửa segment ${s.id}`}
              onClick={() => onEdit(s)}
            >
              Sửa
            </Button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
