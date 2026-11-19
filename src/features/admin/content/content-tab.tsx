"use client";

/**
 * Tab "Nội dung học" — danh sách bài/nguồn/segment + wizard tạo bài nghe
 * YouTube + form sửa có cấu trúc. Không có thao tác xoá vật lý.
 */
import { useCallback, useEffect, useState } from "react";
import { Button, Icon, Spinner } from "@/components/ui";
import type {
  AdminActivity,
  AdminSegment,
  AdminSource,
} from "@/contracts/admin-content";
import { listActivities, listSegments, listSources } from "../admin-api";
import { inputCls } from "../form-bits";
import { REVIEW_STATE_OPTIONS } from "../labels";
import LessonWizard from "../wizard/lesson-wizard";
import ActivityEditForm from "./activity-edit-form";
import {
  ActivitiesTable,
  SegmentsTable,
  SourcesTable,
} from "./content-tables";
import SegmentEditForm from "./segment-edit-form";
import SourceEditForm from "./source-edit-form";

type View =
  | { kind: "list" }
  | { kind: "wizard" }
  | { kind: "activity"; item: AdminActivity }
  | { kind: "source"; item: AdminSource | null }
  | { kind: "segment"; item: AdminSegment | null };

export default function ContentTab() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [segments, setSegments] = useState<AdminSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "list" });
  const [stateFilter, setStateFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s, g] = await Promise.all([
        listActivities(),
        listSources(),
        listSegments(),
      ]);
      setActivities(a.activities);
      setSources(s.sources);
      setSegments(g.segments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được nội dung.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const done = () => {
    setView({ kind: "list" });
    load();
  };

  if (view.kind === "wizard") {
    return (
      <LessonWizard
        existingActivityIds={activities.map((a) => a.id)}
        // Chỉ reload nền — giữ wizard mở để hiển thị màn "Đã duyệt" +
        // nút "Xem trong Thư viện" / "Học thử ngay".
        onDone={load}
        onCancel={() => setView({ kind: "list" })}
      />
    );
  }
  if (view.kind === "activity") {
    return (
      <ActivityEditForm
        activity={view.item}
        segments={segments}
        sources={sources}
        onSaved={done}
        onCancel={() => setView({ kind: "list" })}
      />
    );
  }
  if (view.kind === "source") {
    return (
      <SourceEditForm
        source={view.item}
        onSaved={done}
        onCancel={() => setView({ kind: "list" })}
      />
    );
  }
  if (view.kind === "segment") {
    return (
      <SegmentEditForm
        segment={view.item}
        sources={sources}
        onSaved={done}
        onCancel={() => setView({ kind: "list" })}
      />
    );
  }

  const shown =
    stateFilter === "all"
      ? activities
      : activities.filter((a) => a.reviewState === stateFilter);

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 text-red-800 text-sm rounded-lg border border-red-200 flex items-center justify-between gap-2"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={load}>
            Thử lại
          </Button>
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Bài học ({activities.length})
            </h2>
            <p className="text-xs text-slate-500">
              Tạo bài nghe YouTube end-to-end bằng wizard 4 bước.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Lọc theo trạng thái"
              className={`${inputCls} !w-auto`}
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {REVIEW_STATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={() => setView({ kind: "wizard" })}>
              <Icon name="plus" className="h-4 w-4" /> Bài nghe YouTube mới
            </Button>
          </div>
        </div>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Spinner size="sm" /> Đang tải…
          </p>
        ) : (
          <ActivitiesTable
            rows={shown}
            onEdit={(item) => setView({ kind: "activity", item })}
          />
        )}
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-800">
            Nguồn ({sources.length})
          </h2>
          <Button
            variant="outline"
            onClick={() => setView({ kind: "source", item: null })}
          >
            <Icon name="plus" className="h-4 w-4" /> Nguồn mới
          </Button>
        </div>
        <SourcesTable
          rows={sources}
          onEdit={(item) => setView({ kind: "source", item })}
        />
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-800">
            Segment ({segments.length})
          </h2>
          <Button
            variant="outline"
            disabled={sources.length === 0}
            title={sources.length === 0 ? "Tạo nguồn trước" : undefined}
            onClick={() => setView({ kind: "segment", item: null })}
          >
            <Icon name="plus" className="h-4 w-4" /> Segment mới
          </Button>
        </div>
        <SegmentsTable
          rows={segments}
          onEdit={(item) => setView({ kind: "segment", item })}
        />
      </section>
    </div>
  );
}
