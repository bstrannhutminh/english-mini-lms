import { eq } from "drizzle-orm";
import { db } from "@/db";
import { learners } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export interface CurrentLearner {
  id: string;
  userId: string;
  displayName: string | null;
  role: "learner" | "admin";
  baselineStatus?: string | null;
  preferences?: Record<string, unknown> | null;
}

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

const LEARNER_COLUMNS = {
  id: learners.id,
  userId: learners.userId,
  displayName: learners.displayName,
  role: learners.role,
  baselineStatus: learners.baselineStatus,
  preferences: learners.preferences,
};

async function findLearnerByUserId(userId: string): Promise<CurrentLearner | null> {
  const [learner] = await db.select(LEARNER_COLUMNS).from(learners)
    .where(eq(learners.userId, userId)).limit(1);
  return learner ? learner as CurrentLearner : null;
}

/**
 * Lấy thông tin learner hiện tại từ Supabase Auth session.
 * Tự động tạo bản ghi learners nếu người dùng mới đăng nhập lần đầu.
 * Hỗ trợ dev bypass khi bật biến DEV_BYPASS_AUTH=true.
 */
export async function getCurrentLearner(): Promise<CurrentLearner | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [existing] = await db
      .select(LEARNER_COLUMNS)
      .from(learners)
      .where(eq(learners.userId, user.id))
      .limit(1);

    if (existing) {
      return existing as CurrentLearner;
    }

    const [existingAdmin] = await db
      .select({ id: learners.id })
      .from(learners)
      .where(eq(learners.role, "admin"))
      .limit(1);
    const bootstrapRole: "learner" | "admin" = existingAdmin
      ? "learner"
      : "admin";

    const [created] = await db
      .insert(learners)
      .values({
        userId: user.id,
        displayName: user.email ? user.email.split("@")[0] : "BS. Minh",
        role: bootstrapRole,
        preferences: { remindEnabled: false, remindTime: "20:00" },
      })
      .onConflictDoNothing({ target: learners.userId })
      .returning(LEARNER_COLUMNS);

    // Layout and page can bootstrap the same account concurrently.
    return created ? created as CurrentLearner : await findLearnerByUserId(user.id);
  }

  // Chế độ phát triển dev bypass
  if (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true"
  ) {
    const [devLearner] = await db
      .select(LEARNER_COLUMNS)
      .from(learners)
      .where(eq(learners.userId, DEV_USER_ID))
      .limit(1);

    if (devLearner) {
      return devLearner as CurrentLearner;
    }

    const [createdDev] = await db
      .insert(learners)
      .values({
        userId: DEV_USER_ID,
        displayName: "BS. Minh (Dev)",
        role: "admin",
        preferences: { remindEnabled: false, remindTime: "20:00" },
      })
      .onConflictDoNothing({ target: learners.userId })
      .returning(LEARNER_COLUMNS);

    return createdDev ? createdDev as CurrentLearner : await findLearnerByUserId(DEV_USER_ID);
  }

  return null;
}
