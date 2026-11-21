import { SkillTile } from "@/components/ui";
import type { ActivityListItemContract } from "@/contracts/library";
import { modeSkill, SKILL_INFO, type Skill } from "@/lib/modes";
import { ActivityCard } from "./activity-card";

const SKILL_ORDER: readonly Skill[] = ["writing", "reading", "speaking", "listening"];
const GRID_CLASS = "grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3";

/**
 * Lưới thẻ bài học: 1 cột mobile, 2 cột ≥md, 3 cột ≥xl, các thẻ cùng hàng cao bằng nhau.
 * `grouped` = chia theo kỹ năng với tiêu đề mục (khi chưa lọc theo kỹ năng).
 */
export function ActivityGrid({ activities, grouped, suggestedId }: {
  activities: ActivityListItemContract[];
  grouped: boolean;
  suggestedId?: string;
}) {
  const groups = SKILL_ORDER
    .map((skill) => ({ skill, items: activities.filter((activity) => modeSkill(activity.mode) === skill) }))
    .filter((group) => group.items.length > 0);
  const ungrouped = activities.filter((activity) => modeSkill(activity.mode) === null);
  const useGroups = grouped && groups.length >= 2;
  // Guided tour trỏ vào thẻ ĐẦU TIÊN người học nhìn thấy (theo thứ tự hiển thị).
  const firstId = (useGroups ? groups[0].items[0] : activities[0])?.id;
  const renderCards = (items: ActivityListItemContract[]) => (
    <ul className={GRID_CLASS}>
      {items.map((activity) => (
        <li key={activity.id} className="min-w-0">
          <ActivityCard activity={activity} suggested={suggestedId === activity.id} tourTarget={activity.id === firstId} />
        </li>
      ))}
    </ul>
  );
  if (!useGroups) return renderCards(activities);

  return (
    <div className="space-y-7">
      {groups.map(({ skill, items }) => (
        <section key={skill} aria-labelledby={`library-group-${skill}`} className="space-y-3">
          <div className="flex items-center gap-3">
            <SkillTile mode={skill} size="sm" />
            <h2 id={`library-group-${skill}`} className="text-lg font-semibold text-text">{SKILL_INFO[skill].label}</h2>
            <span className="text-sm tabular-nums text-text-muted">{items.length} bài</span>
          </div>
          {renderCards(items)}
        </section>
      ))}
      {ungrouped.length > 0 && renderCards(ungrouped)}
    </div>
  );
}
