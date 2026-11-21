"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { onboardingPostResponseSchema, type OnboardingProfile } from "@/contracts/onboarding";
import { preferencesResponseSchema } from "@/contracts/settings";
import { Button, Icon, useToast } from "@/components/ui";
import { buildOnboardingPayload, createInitialDraft, type OnboardingDraft } from "./onboarding-presets";
import { ONBOARDING_STEPS, OnboardingHeader, OnboardingProgress } from "./onboarding-header";
import { StepGoals } from "./step-goals";
import { StepSchedule } from "./step-schedule";
import { StepSkills } from "./step-skills";
import { StepPreview } from "./step-preview";
import styles from "./onboarding-view.module.css";
interface OnboardingViewProps {
  initialProfile: OnboardingProfile | null;
}
export function OnboardingView({ initialProfile }: OnboardingViewProps) {
  const router = useRouter();
  const toast = useToast();
  const isReturning = initialProfile?.baselineStatus === "completed";
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => createInitialDraft(initialProfile));
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const pending = saving || skipping;
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  useEffect(() => { stepRef.current?.focus(); }, [step]);
  useEffect(() => {
    if (error)
      errorRef.current?.focus();
  }, [error]);
  function updateDraft(patch: Partial<OnboardingDraft>) { setDraft((previous) => ({ ...previous, ...patch })); }
  async function handleSkipOrBack() {
    if (pendingRef.current)
      return;
    if (isReturning) {
      router.push("/today");
      return;
    }
    pendingRef.current = true;
    setSkipping(true);
    setError(null);
    try {
      await apiFetch("/api/v1/settings/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingSkipped: true, tourCompleted: true, targetMinutesDefault: draft.targetMinutesDefault }) }, preferencesResponseSchema);
      router.push("/today");
      router.refresh();
    }
    catch {
      setError("Chưa thể lưu lựa chọn bỏ qua. Kiểm tra kết nối rồi thử lại; thiết lập vẫn được giữ ở đây.");
    }
    finally {
      pendingRef.current = false;
      setSkipping(false);
    }
  }
  async function handleFinish() {
    if (pendingRef.current)
      return;
    pendingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/v1/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildOnboardingPayload(draft)) }, onboardingPostResponseSchema);
      toast.success("Đã lưu thiết lập", "Trang Hôm nay dùng thời lượng và mục tiêu bạn đã chọn.");
      router.push("/today");
      router.refresh();
    }
    catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Chưa thể lưu hồ sơ. Lựa chọn vẫn được giữ; vui lòng thử lại.";
      setError(message);
    }
    finally {
      pendingRef.current = false;
      setSaving(false);
    }
  }
  return (
    <div className="min-h-dvh bg-surface-muted">
      <OnboardingHeader isReturning={isReturning} skipping={skipping} saving={saving} onSkipOrBack={() => void handleSkipOrBack()} />

      <main className="mx-auto grid max-w-5xl items-start gap-6 px-4 pb-36 pt-6 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8 lg:pt-10">
        <OnboardingProgress step={step} disabled={pending} onSelectStep={setStep} />
        <div className="min-w-0">
          {error && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-4 flex scroll-mt-6 items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-base leading-relaxed text-danger">
            <Icon name="alert-triangle" className="mt-1 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>}

          <form id="onboarding-form" onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            if (isLastStep) void handleFinish();
            else setStep((current) => Math.min(ONBOARDING_STEPS.length - 1, current + 1));
          }}>
            <fieldset disabled={pending} className="min-w-0 rounded-2xl border border-border border-t-4 border-t-primary bg-surface p-5 sm:p-8">
              <div ref={stepRef} tabIndex={-1} aria-label={`Bước ${step + 1}: ${ONBOARDING_STEPS[step].label}`} className={`${styles.step} scroll-mt-6`}>
                {step === 0 && <StepGoals draft={draft} onChange={updateDraft} />}
                {step === 1 && <StepSchedule draft={draft} onChange={updateDraft} />}
                {step === 2 && <StepSkills draft={draft} onChange={updateDraft} />}
                {step === 3 && <StepPreview draft={draft} />}
              </div>
            </fieldset>
          </form>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mx-auto grid max-w-5xl gap-8 sm:px-2 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <span aria-hidden="true" className="hidden lg:block" />
          <div className="flex min-w-0 items-center justify-between gap-3">
            {step > 0 ? <Button variant="outline" size="lg" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={pending} className="shrink-0 px-3">
              <Icon name="arrow-left" className="h-4 w-4" />Quay lại
            </Button> : <p className="text-base text-text-secondary">Có thể sửa sau.</p>}
            <Button type="submit" form="onboarding-form" size="lg" loading={saving} disabled={pending} className="min-h-14 min-w-0 flex-1 px-3 sm:flex-none sm:px-5">
              {saving ? "Đang lưu…" : isLastStep ? "Lưu và vào học" : "Tiếp tục"}
              {!saving && <Icon name={isLastStep ? "check" : "arrow-right"} className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
