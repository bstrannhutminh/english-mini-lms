"use client";

/**
 * Entry dynamic-import cho skill Listening — session-root chỉ tải chunk này
 * khi phiên học đúng là listening, thay vì static import cả 4 skill.
 */
import { SessionShell } from "../../shell/session-shell";
import type { PluginShellProps } from "../../shell/plugin-shell-props";
import { listeningPlugin } from "./index";

export function ListeningPluginShell({ isIelts, data }: PluginShellProps) {
  return <SessionShell plugin={listeningPlugin} isIelts={isIelts} data={data} />;
}
