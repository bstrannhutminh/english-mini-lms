import { isValidTopicKey } from "@/lib/topics";
import type { LibraryFilterState, LibrarySkillFilter, LibraryStatusFilter } from "./filter-activities";

const SKILLS: readonly LibrarySkillFilter[] = ["all", "writing", "reading", "speaking", "listening", "ielts"];
const STATUSES: readonly LibraryStatusFilter[] = ["all", "not_started", "in_progress", "completed"];

export const EMPTY_LIBRARY_FILTERS: LibraryFilterState = { topic: null, skill: "all", status: "all", query: "" };

/** Invalid controls fall back safely; valid legacy topic links keep their scope. */
export function parseLibraryFilterUrl(params: Pick<URLSearchParams, "get">): LibraryFilterState {
  const rawTopic = params.get("topic")?.trim() || null;
  const skill = params.get("skill");
  const status = params.get("status");
  return {
    topic: rawTopic && isValidTopicKey(rawTopic) ? rawTopic : null,
    skill: SKILLS.includes(skill as LibrarySkillFilter) ? skill as LibrarySkillFilter : "all",
    status: STATUSES.includes(status as LibraryStatusFilter) ? status as LibraryStatusFilter : "all",
    query: params.get("q") ?? params.get("query") ?? "",
  };
}

/** Only the explorer's keys change; unrelated deep-link parameters survive. */
export function serializeLibraryFilterUrl(params: URLSearchParams, filters: LibraryFilterState): string {
  const next = new URLSearchParams(params);
  for (const key of ["topic", "skill", "status", "q", "query"]) next.delete(key);
  if (filters.topic) next.set("topic", filters.topic);
  if (filters.skill !== "all") next.set("skill", filters.skill);
  if (filters.status !== "all") next.set("status", filters.status);
  if (filters.query) next.set("q", filters.query);
  return next.toString();
}
