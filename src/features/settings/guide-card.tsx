"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardHeader } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { preferencesResponseSchema } from "@/contracts/settings";
import { TOUR_DONE_KEY, TOUR_STEP_KEY } from "@/components/tour-host";

/** Xem lại hướng dẫn: xoá cờ đã xem → mở lại tour từ bước đầu ở Hôm nay. */
export function GuideCard() {
  const router = useRouter();

  async function handleReplay() {
    try {
      localStorage.removeItem(TOUR_DONE_KEY);
      sessionStorage.removeItem(TOUR_STEP_KEY);
    } catch {
      // trình duyệt chặn storage — bỏ qua
    }
    // Không chặn điều hướng nếu lưu cờ thất bại: ?tour=1 đã đủ để khởi động
    await apiFetch(
      "/api/v1/settings/preferences",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourCompleted: false }),
      },
      preferencesResponseSchema
    ).catch(() => undefined);
    router.push("/today?tour=1");
  }

  return (
    <Card className="space-y-3">
      <CardHeader
        title="Hướng dẫn sử dụng"
        description="Xem lại tour ngắn chỉ vị trí các khu vực chính: Hôm nay, Thư viện, Sổ từ, Tiến độ."
      />
      <Button variant="outline" onClick={handleReplay} className="w-full sm:w-auto">
        <span aria-hidden>▶️</span> Xem lại hướng dẫn
      </Button>
    </Card>
  );
}
