import { eq } from "drizzle-orm";
import { db } from "@/db";
import { learners } from "@/db/schema";
import {
  preferencesPatchSchema,
  type PreferencesPatch,
} from "@/contracts/settings";

/**
 * Các khoá cài đặt người học được phép PATCH qua /api/v1/settings/preferences.
 * Schema sống ở src/contracts/settings.ts (dùng chung route ⇄ client);
 * re-export ở đây để giữ import cũ (tests, callers).
 */
export { preferencesPatchSchema };
export type { PreferencesPatch };

const DEFAULT_REMIND_TIME = "20:00";

/**
 * Gộp patch vào preferences hiện có (hàm thuần, dễ test).
 * - Luôn đảm bảo có remindEnabled/remindTime (mặc định false / 20:00) như trước đây.
 * - tourCompleted: true → ghi cờ; false → xoá khoá (để lần sau hiện lại hướng dẫn).
 * - Giữ nguyên mọi khoá lạ trong preferences hiện có.
 */
export function mergePreferences(
  existing: Record<string, unknown> | null | undefined,
  patch: PreferencesPatch,
  now: Date = new Date(),
): Record<string, unknown> {
  const base = { ...(existing ?? {}) };

  const merged: Record<string, unknown> = {
    ...base,
    remindEnabled:
      patch.remindEnabled !== undefined
        ? patch.remindEnabled
        : typeof base.remindEnabled === "boolean"
          ? base.remindEnabled
          : false,
    remindTime:
      patch.remindTime !== undefined
        ? patch.remindTime
        : typeof base.remindTime === "string" && base.remindTime
          ? base.remindTime
          : DEFAULT_REMIND_TIME,
    updatedAt: now.toISOString(),
  };

  if (patch.tourCompleted === true) {
    merged.tourCompleted = true;
  } else if (patch.tourCompleted === false) {
    delete merged.tourCompleted;
  }

  return merged;
}

/**
 * Đọc preferences hiện tại → merge patch → ghi lại vào learners.
 * Trả về preferences sau khi cập nhật.
 */
export async function updateLearnerPreferences(
  learnerId: string,
  patch: PreferencesPatch,
): Promise<Record<string, unknown>> {
  const [current] = await db
    .select({ preferences: learners.preferences })
    .from(learners)
    .where(eq(learners.id, learnerId))
    .limit(1);

  const updated = mergePreferences(
    current?.preferences as Record<string, unknown> | null,
    patch,
  );

  await db
    .update(learners)
    .set({ preferences: updated })
    .where(eq(learners.id, learnerId));

  return updated;
}
