import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentLearner } from "@/server/auth";
import { getLearnerVocabulary } from "@/server/vocabulary/service";
import { AppNav } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { TourHost } from "@/components/tour-host";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true";

  if (!user && !isDevBypass) {
    redirect("/login");
  }

  // Cờ đã xem hướng dẫn nhanh — nếu không đọc được learner thì coi như đã xem để không làm phiền
  const learner = await getCurrentLearner().catch(() => null);
  const tourCompleted = learner ? Boolean(learner.preferences?.tourCompleted) : true;

  // Badge "Sổ từ": số từ đến hạn — đếm từ dữ liệu vocab hiện có (service
  // getLearnerVocabulary filter "due" = due_at <= now). Lỗi DB → ẩn badge,
  // không để shell hỏng.
  const vocabDueCount = learner
    ? await getLearnerVocabulary(learner.id, "due")
        .then((items) => items.length)
        .catch(() => 0)
    : 0;

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-surface-muted">
        {/* Điều hướng: sidebar (≥lg) + thanh trên & tab dưới (<lg) */}
        <AppNav
          vocabDueCount={vocabDueCount}
          user={{
            displayName: learner?.displayName ?? null,
            isAdmin: learner?.role === "admin",
          }}
        />

        {/* Nội dung — chừa chỗ cho top bar + bottom tab (mobile), sidebar (desktop) */}
        <main className="flex-1 pb-(--nav-height) pt-(--topbar-height) lg:pb-0 lg:pl-(--sidebar-width) lg:pt-0">
          {children}
        </main>

        {/* Hướng dẫn nhanh (guided tour) — useSearchParams cần Suspense */}
        <Suspense fallback={null}>
          <TourHost tourCompleted={tourCompleted} />
        </Suspense>
      </div>
    </ToastProvider>
  );
}
