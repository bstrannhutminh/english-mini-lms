import Link from "next/link";
import { Card, EmptyState } from "@/components/ui";
import type { TopicSummary } from "@/contracts/library";
import { getTopicMeta, UNCATEGORIZED_TOPIC } from "@/lib/topics";

/**
 * Màn đầu của /library: lưới thẻ chủ đề (chủ đề → bài).
 * Mỗi thẻ là Link tới /library?topic=<key> nên deep-link và nút Back của
 * trình duyệt đều chạy đúng. Component thuần — render ở server.
 */
export function TopicGrid({ topics }: { topics: TopicSummary[] }) {
  if (topics.length === 0) {
    return (
      <EmptyState
        icon="book"
        title="Chưa có bài học nào"
        description="Nội dung đang được biên soạn hoặc chưa chuyển sang trạng thái đã duyệt. Quay lại sau nhé."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((t, index) => {
        const meta = getTopicMeta(t.topic);
        const key = t.topic ?? UNCATEGORIZED_TOPIC;
        const progressPct =
          t.activityCount > 0
            ? Math.round((t.learnedCount / t.activityCount) * 100)
            : 0;

        return (
          <Link
            key={key}
            href={`/library?topic=${encodeURIComponent(key)}`}
            data-tour={index === 0 ? "library-card" : undefined}
            className="block rounded-2xl no-underline"
          >
            <Card
              interactive
              padded
              className="flex h-full flex-col gap-2.5 p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-3xl"
                >
                  {meta.icon}
                </span>
                <h2 className="m-0 text-[1.0625rem] font-semibold leading-snug text-text">
                  {meta.name}
                </h2>
              </div>

              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>{t.activityCount} bài</span>
                <span className="text-text-muted">
                  Đã học {t.learnedCount}/{t.activityCount}
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Tiến độ chủ đề ${meta.name}`}
                className="h-1.5 overflow-hidden rounded-full bg-slate-200"
              >
                {/* width là giá trị động — style inline được phép */}
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
