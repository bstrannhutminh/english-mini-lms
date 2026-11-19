"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  onboardingPostResponseSchema,
  type OnboardingProfile,
} from "@/contracts/onboarding";
import { Button, useToast } from "@/components/ui";
import { PRIORITY_OPTIONS, PriorityPicker } from "./priority-picker";
import { SkillSliders } from "./skill-sliders";
import {
  IeltsVariantPicker,
  StudyScheduleFields,
  type IeltsVariantChoice,
} from "./schedule-fields";

interface OnboardingViewProps {
  initialProfile: OnboardingProfile | null;
}

/** Hồ sơ học tập (Onboarding) — form một trang, lưu qua POST /api/v1/onboarding. */
export function OnboardingView({ initialProfile }: OnboardingViewProps) {
  const router = useRouter();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(
    initialProfile?.displayName || "Bác sĩ Minh"
  );
  const [priorities, setPriorities] = useState<string[]>(
    initialProfile?.priorities && initialProfile.priorities.length > 0
      ? initialProfile.priorities
      : [PRIORITY_OPTIONS[0], PRIORITY_OPTIONS[1]]
  );
  const [selfAssessment, setSelfAssessment] = useState(
    initialProfile?.selfAssessment || {
      writing: 3,
      reading: 4,
      speaking: 3,
      listening: 3,
    }
  );
  const [workContext, setWorkContext] = useState(
    initialProfile?.workContext ||
      "Bác sĩ chuyên khoa Cơ Xương Khớp / Siêu âm can thiệp, thường xuyên đọc tài liệu tiếng Anh và trao đổi hội nghị."
  );
  const [ieltsVariant, setIeltsVariant] = useState<IeltsVariantChoice>(
    initialProfile?.ieltsVariant || "none"
  );
  const [currentBook, setCurrentBook] = useState(
    initialProfile?.currentBook || "Musculoskeletal Ultrasound Handbook"
  );
  const [preferredStudyTime, setPreferredStudyTime] = useState(
    initialProfile?.preferredStudyTime || "21:00"
  );
  const [targetMinutesDefault, setTargetMinutesDefault] = useState<number>(
    initialProfile?.targetMinutesDefault || 30
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(
        "/api/v1/onboarding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName,
            priorities,
            selfAssessment,
            workContext,
            ieltsVariant: ieltsVariant === "none" ? null : ieltsVariant,
            currentBook,
            preferredStudyTime,
            targetMinutesDefault,
          }),
        },
        onboardingPostResponseSchema
      );

      setSavedSuccess(true);
      setTimeout(() => {
        router.push("/today");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Lỗi lưu hồ sơ onboarding:", err);
      const text =
        err instanceof ApiClientError
          ? err.message
          : "Lỗi kết nối máy chủ. Vui lòng thử lại.";
      setError(text);
      toast.error("Không thể lưu hồ sơ", text);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm";
  const labelClass =
    "block text-xs font-bold uppercase tracking-wider text-slate-800";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/today"
          className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-800"
        >
          ← Quay lại Hôm nay
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
          <span>🎯</span> Thiết lập Hồ sơ Học tập (Onboarding)
        </h1>
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
          Cung cấp thông tin bối cảnh công việc và mục tiêu cá nhân để hệ thống
          gợi ý bài học sát với nhu cầu thực tế của Bác sĩ.
        </p>
      </div>

      {savedSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 shadow-xs sm:text-sm"
        >
          <span>✅</span> Đã lưu hồ sơ thành công! Đang chuyển hướng về trang
          Hôm nay...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm"
        >
          ⚠️ {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <label htmlFor="display-name" className={labelClass}>
            1. Tên hiển thị
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
            placeholder="Ví dụ: Bác sĩ Minh"
            required
          />
        </div>

        <div className="space-y-2">
          <span className={labelClass}>
            2. Mục tiêu ưu tiên (chọn một hoặc nhiều)
          </span>
          <PriorityPicker values={priorities} onChange={setPriorities} />
        </div>

        <div className="space-y-3">
          <span className={labelClass}>
            3. Tự đánh giá năng lực hiện tại (Thang điểm 1 - 5)
          </span>
          <SkillSliders values={selfAssessment} onChange={setSelfAssessment} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="work-context" className={labelClass}>
            4. Bối cảnh chuyên môn & công việc
          </label>
          <textarea
            id="work-context"
            value={workContext}
            onChange={(e) => setWorkContext(e.target.value)}
            rows={3}
            className={`${inputClass} leading-relaxed`}
            placeholder="Mô tả chuyên khoa, công việc thường ngày cần tiếng Anh..."
          />
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>
            5. Biến thể IELTS (Tùy chọn - có thể bỏ trống)
          </span>
          <IeltsVariantPicker value={ieltsVariant} onChange={setIeltsVariant} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="current-book" className={labelClass}>
            6. Sách / Tài liệu y khoa đang đọc
          </label>
          <input
            id="current-book"
            type="text"
            value={currentBook}
            onChange={(e) => setCurrentBook(e.target.value)}
            className={inputClass}
            placeholder="Tên giáo trình hoặc sách chuyên khảo đang tham khảo..."
          />
        </div>

        <StudyScheduleFields
          preferredStudyTime={preferredStudyTime}
          targetMinutes={targetMinutesDefault}
          onTimeChange={setPreferredStudyTime}
          onMinutesChange={setTargetMinutesDefault}
        />

        <div className="border-t pt-4">
          <Button type="submit" fullWidth size="lg" loading={saving}>
            {saving ? "Đang lưu hồ sơ..." : "💾 Lưu hồ sơ và hoàn tất Onboarding"}
          </Button>
        </div>
      </form>
    </div>
  );
}
