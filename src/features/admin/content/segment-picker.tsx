"use client";

/** Chọn segment cho bài học — checkbox + tóm tắt vị trí/nội dung. */
import type { AdminSegment, AdminSource } from "@/contracts/admin-content";
import { inputCls } from "../form-bits";

function describe(seg: AdminSegment, sources: AdminSource[]): string {
  const src = sources.find((s) => s.id === seg.sourceId);
  const where =
    seg.page != null
      ? `tr.${seg.page}`
      : seg.startSeconds != null
        ? `${seg.startSeconds}–${seg.endSeconds ?? "?"}s`
        : "";
  const has = [
    seg.textContent ? "text" : "",
    seg.transcriptContent ? "transcript" : "",
  ]
    .filter(Boolean)
    .join("+");
  return `${seg.id} · ${src?.title ?? seg.sourceId}${where ? ` · ${where}` : ""}${has ? ` · ${has}` : ""}`;
}

export default function SegmentPicker({
  segments,
  sources,
  selected,
  onChange,
}: {
  segments: AdminSegment[];
  sources: AdminSource[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">
        Segment dùng trong bài{" "}
        <span className="text-slate-400 font-normal">
          (thứ tự chọn = thứ tự dùng)
        </span>
      </span>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
        {segments.length === 0 && (
          <p className="p-3 text-sm text-slate-400 italic">
            Chưa có segment nào — tạo segment trước.
          </p>
        )}
        {segments.map((seg) => {
          const checked = selected.includes(seg.id);
          return (
            <label
              key={seg.id}
              className={`flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                checked ? "bg-indigo-50/60 text-slate-800" : "text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-indigo-600"
                checked={checked}
                onChange={() =>
                  onChange(
                    checked
                      ? selected.filter((id) => id !== seg.id)
                      : [...selected, seg.id]
                  )
                }
              />
              <span className="truncate">{describe(seg, sources)}</span>
            </label>
          );
        })}
      </div>
      {selected.length > 0 && (
        <input
          className={inputCls}
          value={selected.join(", ")}
          readOnly
          aria-label="Thứ tự segment đã chọn"
        />
      )}
    </div>
  );
}
