"use client";

import { Button, Icon, Spinner } from "@/components/ui";
import { useAssessmentPolling } from "./use-assessment-polling";

interface PendingStateProps {
  status: string; // "queued" | "processing"
}

/** Những phần sẽ xuất hiện khi chấm xong — để người học biết mình đang chờ gì. */
const UPCOMING = ["Điểm ước tính luyện tập", "Các điểm cần sửa trước", "Việc cần làm ở bản tiếp theo"];

/**
 * Thẻ "đang chấm" — tự cập nhật (poll router.refresh 6s) khi assessment
 * đang queued/processing. Hết ~5 phút mà chưa xong → báo chậm + nút làm mới tay.
 */
export function PendingState({ status }: PendingStateProps) {
  const { polling, timedOut, refresh } = useAssessmentPolling(status);

  return (
    <section aria-live="polite" className="rounded-2xl border border-teal-200 bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
          {timedOut ? <Icon name="clock" className="h-5 w-5" /> : <Spinner size="md" label="Đang chờ chấm" />}
        </span>
        <h2 className="min-w-0 text-lg font-semibold leading-snug text-text">
          {timedOut ? "Việc chấm đang lâu hơn bình thường" : "AI đang chấm bài của bạn"}
        </h2>
      </div>

      <div className="mt-3 sm:pl-[52px]">
        <p className="text-base leading-relaxed text-text-secondary">
          {status === "queued"
            ? "Bài nộp đã được lưu và đang trong hàng đợi chấm."
            : "Bài nộp đã được lưu, Gemini đang phân tích bài làm theo rubric."}{" "}
          {polling
            ? "Trang sẽ tự cập nhật vài giây một lần — bạn không cần bấm gì."
            : "Bạn có thể làm mới tay hoặc quay lại sau; bài nộp vẫn được giữ nguyên."}
        </p>

        <p className="eyebrow mt-4">Khi chấm xong bạn sẽ thấy</p>
        <ul className="mt-1.5 flex flex-col gap-x-8 gap-y-1 text-base text-text-secondary sm:flex-row sm:flex-wrap">
          {UPCOMING.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-200" />
              {item}
            </li>
          ))}
        </ul>

        <Button variant="outline" onClick={refresh} className="mt-4">
          <Icon name="refresh" className="h-4 w-4" />
          Làm mới kết quả
        </Button>
      </div>
    </section>
  );
}
