import { eq } from "drizzle-orm";
import { db } from "@/db";
import { learners } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export interface CurrentLearner {
  id: string;
  userId: string;
  displayName: string | null;
  role: "learner" | "admin";
  preferences?: Record<string, unknown> | null;
}

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

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
      .select({
        id: learners.id,
        userId: learners.userId,
        displayName: learners.displayName,
        role: learners.role,
        preferences: learners.preferences,
      })
      .from(learners)
      .where(eq(learners.userId, user.id))
      .limit(1);

    if (existing) {
      return existing as CurrentLearner;
    }

    // Bootstrap admin: chỉ learner ĐẦU TIÊN (khi chưa có admin nào) được cấp
    // role=admin — để deploy mới vẫn có người quản trị. Mọi user sau đó mặc
    // định là learner (fix review cũ: auto-grant admin cho mọi user mới).
    // Race 2-user-login đồng thời lần đầu → có thể 2 admin; chấp nhận được
    // cho app 1 người dùng, không rò quyền.
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
      .returning({
        id: learners.id,
        userId: learners.userId,
        displayName: learners.displayName,
        role: learners.role,
        preferences: learners.preferences,
      });

    return created as CurrentLearner;
  }

  // Chế độ phát triển dev bypass
  if (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true"
  ) {
    const [devLearner] = await db
      .select({
        id: learners.id,
        userId: learners.userId,
        displayName: learners.displayName,
        role: learners.role,
        preferences: learners.preferences,
      })
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
        role: "admin", // Bác sĩ Minh là admin duy nhất
        preferences: { remindEnabled: false, remindTime: "20:00" },
      })
      .returning({
        id: learners.id,
        userId: learners.userId,
        displayName: learners.displayName,
        role: learners.role,
        preferences: learners.preferences,
      });

    return createdDev as CurrentLearner;
  }

  return null;
}
