"use client";

/**
 * Entry dynamic-import cho skill Speaking — session-root chỉ tải chunk này
 * khi phiên học đúng là speaking, thay vì static import cả 4 skill.
 */
import { SessionShell } from "../../shell/session-shell";
import type { PluginShellProps } from "../../shell/plugin-shell-props";
import { speakingPlugin } from "./index";

export function SpeakingPluginShell({ isIelts, data }: PluginShellProps) {
  return <SessionShell plugin={speakingPlugin} isIelts={isIelts} data={data} />;
}
