"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Skeleton } from "@/components/ui";
import type { Skill } from "@/features/session/modes/types";
import type { PluginShellProps } from "./plugin-shell-props";

type ShellProps = PluginShellProps;

/**
 * Khung chờ trong lúc tải chunk của skill — hiếm khi hiện vì next/dynamic
 * SSR sẵn markup thật; chỉ xuất hiện khi client navigation hoặc hydration
 * chưa kịp tải chunk. Xương theo bố cụ thật: thanh trên + thân 2 cột.
 */
function PluginShellLoading() {
  return (
    <div className="flex min-h-dvh flex-col" aria-hidden="true">
      <div className="border-b border-border bg-surface px-4 py-3">
        <Skeleton className="h-8 w-2/3 max-w-sm rounded-lg" />
      </div>
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/*
 * Dynamic import theo skill: mỗi plugin-shell là một chunk riêng (listening
 * kéo YouTube player + shadowing recorder, speaking kéo MediaRecorder…) nên
 * phiên học chỉ tải đúng chunk skill đang dùng thay vì bundle cả 4 skill
 * như khi MODE_REGISTRY được static import. Chunk cần thiết được preload
 * ngay trong HTML SSR của trang hiện tại.
 */
const WritingPluginShell = dynamic(
  () => import("../modes/writing/plugin-shell").then((m) => m.WritingPluginShell),
  { loading: PluginShellLoading }
);
const ReadingPluginShell = dynamic(
  () => import("../modes/reading/plugin-shell").then((m) => m.ReadingPluginShell),
  { loading: PluginShellLoading }
);
const SpeakingPluginShell = dynamic(
  () => import("../modes/speaking/plugin-shell").then((m) => m.SpeakingPluginShell),
  { loading: PluginShellLoading }
);
const ListeningPluginShell = dynamic(
  () => import("../modes/listening/plugin-shell").then((m) => m.ListeningPluginShell),
  { loading: PluginShellLoading }
);

const PLUGIN_SHELLS: Record<Skill, ComponentType<ShellProps>> = {
  writing: WritingPluginShell,
  reading: ReadingPluginShell,
  speaking: SpeakingPluginShell,
  listening: ListeningPluginShell,
};

interface SessionRootProps {
  skill: Skill;
  isIelts: boolean;
  data: ShellProps["data"];
}

/**
 * Ranh giới server → client của màn Học: Server Component chỉ truyền dữ liệu
 * thuần (skill là string). Plugin chứa hàm/component nên được nạp trong client
 * qua dynamic import — truyền thẳng object plugin từ page.tsx sẽ lỗi RSC
 * "Functions cannot be passed directly to Client Components".
 */
export function SessionRoot({ skill, isIelts, data }: SessionRootProps) {
  const Shell = PLUGIN_SHELLS[skill];
  if (!Shell) return null;
  return <Shell isIelts={isIelts} data={data} />;
}
