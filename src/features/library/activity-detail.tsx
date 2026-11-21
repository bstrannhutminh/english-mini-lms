import Link from "next/link";
import { Badge, Icon, MarkdownText, SkillTile } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { ActivityDetailContract } from "@/contracts/library";
import { getTopicMeta, UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { ActivityDisclosure } from "./activity-disclosure";
import { StartSessionCta } from "./start-session-cta";

const DIFFICULTY_LABELS = { trial: "Thử nghiệm", beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };

/**
 * Trang chi tiết bài học: thẻ hero theo màu kỹ năng (nhận diện + chọn thời lượng +
 * bắt đầu), thẻ đề bài dễ đọc (~65ch) và các mục mở rộng (nguồn học, trọng tâm góp ý).
 * Đáy trang chừa chỗ cho thanh "Bắt đầu" dính đáy trên <lg.
 */
export function ActivityDetail({ activity, reviseParentId }: {
  activity: ActivityDetailContract;
  reviseParentId?: string;
}) {
  const meta = modeMeta(activity.mode);
  const topicMeta = getTopicMeta(activity.topic);
  const topicHref = `/library?topic=${encodeURIComponent(activity.topic ?? UNCATEGORIZED_TOPIC)}`;
  return (
    <div className="space-y-3 pb-24 sm:space-y-4 lg:pb-0">
      <Link href={topicHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-base font-medium text-text-secondary hover:text-primary-dark">
        <Icon name="arrow-left" className="h-4 w-4" />Về {topicMeta.name}
      </Link>

      <header className={`hero-wash hero-wash-${meta.skill} grid gap-5 rounded-2xl border border-border p-5 shadow-card sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 lg:p-8`}>
        <div className="min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <SkillTile mode={activity.mode} size="lg" />
            <div className="min-w-0">
              <p className={`text-base font-semibold ${meta.iconClass}`}>{meta.label}</p>
              <p className="text-sm text-text-muted">{meta.isIelts ? "IELTS · luyện tập · " : ""}{activity.slot || activity.id}</p>
            </div>
          </div>
          <h1 className="mt-4 break-words text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">{activity.title}</h1>
          {activity.objective && <p className="mt-2 max-w-prose text-base leading-relaxed text-text-secondary">{activity.objective}</p>}
          <ul className="mt-4 flex flex-wrap gap-2">
            {activity.durationMinutes && <li><Badge tone="neutral"><Icon name="clock" className="h-3.5 w-3.5" />{activity.durationMinutes} phút dự kiến</Badge></li>}
            {activity.difficulty && <li><Badge tone="neutral"><Icon name="bar-chart" className="h-3.5 w-3.5" />{DIFFICULTY_LABELS[activity.difficulty]}</Badge></li>}
            <li><Badge tone="neutral"><Icon name="bookmark" className="h-3.5 w-3.5" />{topicMeta.name}</Badge></li>
          </ul>
        </div>

        <section aria-label="Bắt đầu bài học" className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="text-lg font-semibold text-text">{reviseParentId ? "Làm bản sửa" : "Dành thời gian cho bài này"}</h2>
          <p className="mt-1 text-base leading-relaxed text-text-secondary">
            {activity.output === "audio" ? "Bạn sẽ ghi âm giọng nói trong bài này." : "Bạn sẽ trả lời bằng văn bản trong bài này."}
            {meta.skill === "listening" && activity.questionCount ? ` Có ${activity.questionCount} câu hỏi nghe hiểu.` : ""}
          </p>
          <StartSessionCta activityId={activity.id} parentId={reviseParentId} />
        </section>
      </header>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        {activity.promptText && (
          <section aria-labelledby="activity-prompt" className="rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:p-8">
            <h2 id="activity-prompt" className="flex items-center gap-2 text-lg font-semibold text-text">
              <Icon name="file-text" className="h-5 w-5 text-text-muted" />Đề bài và hướng dẫn
            </h2>
            <div className="mt-4 max-w-[65ch] text-base leading-relaxed text-text"><MarkdownText text={activity.promptText} /></div>
          </section>
        )}
        <div className="space-y-3">
          {activity.feedbackGuide && (
            <ActivityDisclosure icon="target" title="Trọng tâm góp ý" defaultOpen>
              <p>{activity.feedbackGuide}</p>
            </ActivityDisclosure>
          )}
          {activity.sourceContext && (
            <ActivityDisclosure icon="book-open" title={`Nguồn học: ${activity.sourceContext.sourceTitle}`}>
              {activity.sourceContext.page && <p>Trang tham khảo: {activity.sourceContext.page}</p>}
              {activity.sourceContext.excerpt && <blockquote className="border-l-2 border-border-strong pl-4">{activity.sourceContext.excerpt}</blockquote>}
              <p>Đoạn y khoa được dùng để luyện ngôn ngữ.</p>
            </ActivityDisclosure>
          )}
        </div>
      </div>
    </div>
  );
}
