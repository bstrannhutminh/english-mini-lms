"use client";

/**
 * Entry dynamic-import cho skill Viết — session-root chỉ tải chunk này
 * (kéo theo WritingPanel + state) khi phiên học đúng là writing,
 * thay vì static import cả 4 skill như registry cũ.
 */
import { SessionShell } from "../../shell/session-shell";
import type { PluginShellProps } from "../../shell/plugin-shell-props";
import { writingPlugin } from "./index";

export function WritingPluginShell({ isIelts, data }: PluginShellProps) {
  return <SessionShell plugin={writingPlugin} isIelts={isIelts} data={data} />;
}
