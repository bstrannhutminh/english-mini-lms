"use client";

/**
 * Entry dynamic-import cho skill Reading — session-root chỉ tải chunk này
 * khi phiên học đúng là reading, thay vì static import cả 4 skill.
 */
import { SessionShell } from "../../shell/session-shell";
import type { PluginShellProps } from "../../shell/plugin-shell-props";
import { readingPlugin } from "./index";

export function ReadingPluginShell({ isIelts, data }: PluginShellProps) {
  return <SessionShell plugin={readingPlugin} isIelts={isIelts} data={data} />;
}
