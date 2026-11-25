import type { SessionData } from "../modes/types";

/** Props chung cho 4 plugin-shell dynamic-import (writing/reading/speaking/listening). */
export interface PluginShellProps {
  isIelts: boolean;
  data: SessionData;
}
