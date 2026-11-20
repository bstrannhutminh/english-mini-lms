import Link from "next/link";
import { Badge, Icon, MarkdownText } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { ActivityDetailContract } from "@/contracts/library";
import { getTopicMeta, UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { StartSessionCta } from "./start-session-cta";
export function ActivityDetail({ activity, reviseParentId }: {
  activity: ActivityDetailContract;
  reviseParentId?: string;
}) {
  const meta = modeMeta(activity.mode);
  const topicMeta = getTopicMeta(activity.topic);
  const topicHref = `/library?topic=${encodeURIComponent(activity.topic ?? UNCATEGORIZED_TOPIC)}`;
  return (<div className="space-y-5">

    <Link href={topicHref} className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-text-secondary hover:text-primary-dark"><Icon name="arrow-left" className="h-4 w-4" />Về {topicMeta.name}</Link>

    <header>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-base text-text-secondary">
        <Badge tone={meta.tone}>
          <Icon name={meta.icon} className="h-4 w-4" />
          {meta.label}
        </Badge>
        {meta.isIelts && <Badge tone="neutral">IELTS</Badge>}
        <span>
          {activity.slot || activity.id}
        </span>
        {activity.durationMinutes && <span>· {activity.durationMinutes} phút</span>}
      </div>
      <h1 className="break-words text-3xl font-semibold leading-snug tracking-tight text-text sm:text-4xl">
        {activity.title}
      </h1>
      {activity.objective && <p className="mt-3 max-w-prose text-base leading-relaxed text-text-secondary">
        {activity.objective}
      </p>}
    </header>

    <div className="grid items-start gap-6 lg:grid-cols-12">

      <aside aria-label="Bắt đầu bài học" className="rounded-xl border border-border bg-surface p-5 lg:order-2 lg:col-span-4 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-text">
          {reviseParentId ? "Làm bản sửa" : "Vào buổi học"}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          {activity.output === "audio" ? "Bạn sẽ ghi âm giọng nói trong bài này." : "Bạn sẽ trả lời bằng văn bản trong bài này."}
          {meta.skill === "listening" && activity.questionCount ? ` Có ${activity.questionCount} câu hỏi nghe hiểu.` : ""}
        </p>
        <StartSessionCta activityId={activity.id} parentId={reviseParentId} />
      </aside>

      <article className="min-w-0 space-y-5 lg:col-span-8">

        {activity.promptText && <section aria-labelledby="activity-prompt" className="rounded-xl border border-border bg-surface p-5 sm:p-7">
          <h2 id="activity-prompt" className="mb-4 text-xl font-semibold text-text">Đề bài và hướng dẫn</h2>
          <div className="max-w-prose text-base leading-relaxed text-text">
            <MarkdownText text={activity.promptText} />
          </div>
        </section>}

        {activity.sourceContext && <details className="rounded-xl border border-border bg-surface px-5">
          <summary className="min-h-11 cursor-pointer py-4 text-base font-medium text-text">Nguồn học: {activity.sourceContext.sourceTitle}</summary>
          <div className="space-y-2 pb-5 text-base leading-relaxed text-text-secondary">
            {activity.sourceContext.page && <p>Trang tham khảo: {activity.sourceContext.page}</p>}
            {activity.sourceContext.excerpt && <blockquote className="border-l-2 border-border pl-4">
              {activity.sourceContext.excerpt}
            </blockquote>}
            <p>Đoạn y khoa được dùng để luyện ngôn ngữ.</p>
          </div>
        </details>}

        {activity.feedbackGuide && <details className="rounded-xl border border-border bg-surface px-5">
          <summary className="min-h-11 cursor-pointer py-4 text-base font-medium text-text">Trọng tâm góp ý</summary>
          <p className="pb-5 text-base leading-relaxed text-text-secondary">
            {activity.feedbackGuide}
          </p>
        </details>}

      </article>

    </div>

  </div>);
}
