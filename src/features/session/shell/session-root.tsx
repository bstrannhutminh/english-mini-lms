"use client";

import type { ComponentProps } from "react";
import { MODE_REGISTRY } from "@/features/session/modes/registry";
import type { Skill } from "@/features/session/modes/types";
import { SessionShell } from "./session-shell";

type ShellProps = ComponentProps<typeof SessionShell>;

interface SessionRootProps {
  skill: Skill;
  isIelts: boolean;
  data: ShellProps["data"];
}

/**
 * Ranh giới server → client của màn Học: Server Component chỉ truyền dữ liệu
 * thuần (skill là string). Plugin chứa hàm/component nên được tra từ registry
 * ngay trong client — truyền thẳng object plugin từ page.tsx sẽ lỗi RSC
 * "Functions cannot be passed directly to Client Components".
 */
export function SessionRoot({ skill, isIelts, data }: SessionRootProps) {
  const plugin = MODE_REGISTRY[skill];
  if (!plugin) return null;
  return <SessionShell plugin={plugin} isIelts={isIelts} data={data} />;
}
