import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentLearner, type CurrentLearner } from "@/server/auth";
import { countDueVocabulary } from "@/server/vocabulary/service";
import { MainShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { TourHost } from "@/components/tour-host";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true";

  // Đường chính: getCurrentLearner (đã cache theo request) tự gọi auth.getUser
  // nên layout không cần hỏi Supabase thêm lần nữa. Chỉ khi DB lỗi mới hỏi
  // riêng auth để phân biệt "chưa đăng nhập" với "backend đang hỏng".
  let learner: CurrentLearner | null = null;
  let authenticated = isDevBypass;
  try {
    learner = await getCurrentLearner();
    authenticated = authenticated || learner !== null;
  } catch {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    authenticated = authenticated || user !== null;
  }

  if (!authenticated) {
    redirect("/login");
  }

  // Cờ đã xem hướng dẫn nhanh — nếu không đọc được learner thì coi như đã xem để không làm phiền
  const tourCompleted = learner
    ? Boolean(learner.preferences?.tourCompleted) ||
      learner.baselineStatus === "completed"
    : true;

  // Badge "Sổ từ": số từ đến hạn — lỗi DB → ẩn badge, không để shell hỏng.
  const vocabDueCount = learner
    ? await countDueVocabulary(learner.id).catch(() => 0)
    : 0;

  return (
    <ToastProvider>
      <MainShell
        vocabDueCount={vocabDueCount}
        user={{
          displayName: learner?.displayName ?? null,
          isAdmin: learner?.role === "admin",
        }}
      >
        {children}
      </MainShell>

      {/* Hướng dẫn nhanh (guided tour) — tự ẩn trên Focus Routes */}
      <Suspense fallback={null}>
        <TourHost tourCompleted={tourCompleted} />
      </Suspense>
    </ToastProvider>
  );
}
