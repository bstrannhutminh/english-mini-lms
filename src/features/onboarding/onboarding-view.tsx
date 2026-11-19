"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  onboardingPostResponseSchema,
  type OnboardingProfile,
} from "@/contracts/onboarding";
import { preferencesResponseSchema } from "@/contracts/settings";
import { Button, Icon, useToast } from "@/components/ui";
import { createInitialDraft, type OnboardingDraft } from "./onboarding-presets";
import { ONBOARDING_STEPS, OnboardingHeader } from "./onboarding-header";
import { StepGoals } from "./step-goals";
import { StepSchedule } from "./step-schedule";
import { StepSkills } from "./step-skills";
import { StepPreview } from "./step-preview";

interface OnboardingViewProps {
  initialProfile: OnboardingProfile | null;
}

/**
 * Onboarding 4 bước toàn màn hình (Focus Mode):
 * dẫn người học mới thiết lập mục tiêu, nhịp học, tự đánh giá 4 kỹ năng
 * và xem trước chu trình học 4 bước; luôn cho bỏ qua 1 chạm vào học ngay.
 */
export function OnboardingView({ initialProfile }: OnboardingViewProps) {
  const router = useRouter();
  const toast = useToast();
  const isReturning = initialProfile?.baselineStatus === "completed";

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    createInitialDraft(initialProfile)
  );
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDraft(patch: Partial<OnboardingDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function handleSkipOrBack() {
    if (isReturning) {
      router.push("/today");
      return;
    }
    setSkipping(true);
    setError(null);
    try {
      await apiFetch(
        "/api/v1/settings/preferences",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            onboardingSkipped: true,
            tourCompleted: true,
          }),
        },
        preferencesResponseSchema
      );
      router.push("/today");
      router.refresh();
    } catch {
      setError("Chưa thể lưu lựa chọn bỏ qua. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setSkipping(false);
    }
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(
        "/api/v1/onboarding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: draft.displayName.trim() || "Bác sĩ Minh",
            priorities: draft.priorities,
            selfAssessment: draft.selfAssessment,
            workContext: draft.workContext.trim(),
            ieltsVariant:
              draft.ieltsVariant === "none" ? null : draft.ieltsVariant,
            currentBook: draft.currentBook.trim(),
            preferredStudyTime: draft.preferredStudyTime,
            targetMinutesDefault: draft.targetMinutesDefault,
          }),
        },
        onboardingPostResponseSchema
      );

      toast.success(
        "Đã lưu lộ trình học tập",
        "Trang Hôm nay đã sẵn sàng theo thiết lập của bạn."
      );
      router.push("/today");
      router.refresh();
    } catch (err) {
      const text =
        err instanceof ApiClientError
          ? err.message
          : "Không thể lưu hồ sơ lúc này. Vui lòng thử lại.";
      setError(text);
      toast.error("Lưu thiết lập thất bại", text);
    } finally {
      setSaving(false);
    }
  }

  const isLastStep = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="min-h-dvh bg-surface-muted">
      <OnboardingHeader
        step={step}
        isReturning={isReturning}
        skipping={skipping}
        saving={saving}
        onSelectStep={setStep}
        onSkipOrBack={() => void handleSkipOrBack()}
      />

      <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <Icon name="alert-triangle" className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7">
          {step === 0 && <StepGoals draft={draft} onChange={updateDraft} />}
          {step === 1 && <StepSchedule draft={draft} onChange={updateDraft} />}
          {step === 2 && <StepSkills draft={draft} onChange={updateDraft} />}
          {step === 3 && <StepPreview draft={draft} />}
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {step > 0 ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={saving}
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              Quay lại
            </Button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <Button
              size="lg"
              onClick={() => void handleFinish()}
              loading={saving}
              className="flex-1 sm:min-w-60 sm:flex-none"
            >
              {!saving && <Icon name="check" className="h-4 w-4" />}
              {saving ? "Đang lưu lộ trình..." : "Hoàn tất & Vào học ngay"}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() =>
                setStep((s) => Math.min(ONBOARDING_STEPS.length - 1, s + 1))
              }
              className="min-w-36"
            >
              Tiếp tục
              <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
