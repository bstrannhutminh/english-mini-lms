"use client";
import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { InProgressSession } from "@/contracts/today";
export interface ContinueBlockProps {
  session: InProgressSession;
}
export function ContinueBlock({ session }: ContinueBlockProps) {
  const meta = modeMeta(session.mode);
  return (<section aria-labelledby="today-continue-title" className="rounded-xl border border-border bg-surface p-5 sm:p-7">

    <div className="mb-4 flex flex-wrap items-center gap-2 text-base text-text-secondary">
      <Badge tone={meta.tone}>
        {meta.label}
      </Badge>
      <span>{session.slot ? `${session.slot} · ` : ""}{session.targetMinutes} phút</span>
    </div>

    <p className="mb-2 text-base font-medium text-primary-dark">Tiếp tục phiên đang dở</p>

    <h2 id="today-continue-title" className="break-words text-2xl font-semibold leading-snug tracking-tight text-text sm:text-3xl">
      {session.title}
    </h2>

    <p className="mt-3 text-base leading-relaxed text-text-secondary">Bài làm đang chờ bạn. Tiếp tục phiên hiện tại trước khi mở bài mới.</p>

    <Link href={`/learn/${session.sessionId}`} data-tour="today-start" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white no-underline transition hover:bg-primary-dark"><Icon name="play" className="h-5 w-5" />Tiếp tục bài học</Link>

  </section>);
}
