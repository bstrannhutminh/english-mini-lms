"use client";

/**
 * ContinueBlock — khối 1 của hub Hôm nay (spec §3.3): phiên đang dở
 * (active/paused) luôn trên cùng, vào tiếp bằng 1 chạm.
 */
import Link from "next/link";
import { Icon } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { InProgressSession } from "@/contracts/today";

export interface ContinueBlockProps {
  session: InProgressSession;
}

export function ContinueBlock({ session }: ContinueBlockProps) {
  const meta = modeMeta(session.mode);

  return (
    <div className="space-y-3 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
            <Icon name="clock" className="h-3 w-3 text-amber-800" />
            <span>Phiên đang dở</span>
          </span>
          <span className="text-xs font-medium text-amber-800">
            {session.slot ? `${session.slot} · ` : ""}
            {meta.label}
          </span>
        </div>
        <span className="text-xs font-medium tabular-nums text-amber-800/80">
          Mục tiêu {session.targetMinutes} phút
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">{session.title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          Bạn có một phiên học chưa khép lại. Nhấp để tiếp tục bài làm ngay lập
          tức.
        </p>
      </div>

      <div className="pt-1">
        <Link
          href={`/learn/${session.sessionId}`}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700 active:bg-amber-800 sm:text-sm"
        >
          <Icon name="play" className="h-3.5 w-3.5" />
          <span>Tiếp tục phiên học ngay</span>
        </Link>
      </div>
    </div>
  );
}
