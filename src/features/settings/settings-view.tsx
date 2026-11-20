"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  preferencesPatchSchema,
  preferencesResponseSchema,
  type PreferencesPatch,
} from "@/contracts/settings";
import {
  Button,
  ConfirmDialog,
  Icon,
  Skeleton,
  useToast,
} from "@/components/ui";
import { useSettingsData } from "./use-settings-data";
import { AccountCard } from "./account-card";
import { LearningPlanCard } from "./learning-plan-card";
import { PasswordCard } from "./password-card";
import { ReminderCard } from "./reminder-card";
import { GuideCard } from "./guide-card";
import { ExportCard } from "./export-card";
import { SubmissionsCard } from "./submissions-card";
import { PageContainer } from "@/components/layout";
import { SettingsSection } from "./settings-section";

/**
 * Trang Cài đặt — container ghép các thẻ: tài khoản, mật khẩu, nhắc học,
 * hướng dẫn, xuất dữ liệu, xoá bài, đăng xuất.
 */
export function SettingsView() {
  const router = useRouter();
  const toast = useToast();
  const {
    profile,
    submissions,
    loading,
    error,
    remindEnabled,
    remindTime,
    setReminders,
    reload,
    removeSubmission,
  } = useSettingsData();

  const [savingPrefs, setSavingPrefs] = useState(false);
  const preferencesInFlight = useRef(false);

  // Đăng xuất — ConfirmDialog thay window.confirm
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSavePreferences(
    nextEnabled: boolean,
    nextTime: string
  ): Promise<boolean> {
    if (preferencesInFlight.current) return false;
    preferencesInFlight.current = true;
    const previous = { enabled: remindEnabled, time: remindTime };
    setReminders(nextEnabled, nextTime);
    try {
      setSavingPrefs(true);
      const patch: PreferencesPatch = {
        remindEnabled: nextEnabled,
        remindTime: nextTime,
      };
      const response = await apiFetch(
        "/api/v1/settings/preferences",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferencesPatchSchema.parse(patch)),
        },
        preferencesResponseSchema
      );
      setReminders(
        typeof response.preferences.remindEnabled === "boolean"
          ? response.preferences.remindEnabled
          : nextEnabled,
        typeof response.preferences.remindTime === "string"
          ? response.preferences.remindTime
          : nextTime
      );
      return true;
    } catch (err) {
      setReminders(previous.enabled, previous.time);
      toast.error(
        "Không thể lưu cài đặt",
        err instanceof ApiClientError ? err.message : undefined
      );
      return false;
    } finally {
      preferencesInFlight.current = false;
      setSavingPrefs(false);
    }
  }

  async function handleSignOut() {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSignOutOpen(false);
      setLoggingOut(false);
      toast.error("Đăng xuất thất bại", "Vui lòng thử lại.");
    }
  }

  if (loading) {
    return (
      <PageContainer size="wide" className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <header>
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-description">
          Điều chỉnh lộ trình, tài khoản và dữ liệu học của bạn.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-base text-red-700"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={reload}>
            Thử lại
          </Button>
        </div>
      )}

      <SettingsSection title="Nhịp học của bạn" description="Chọn mục tiêu và thời gian phù hợp để dễ quay lại học mỗi ngày.">
        <LearningPlanCard profile={profile} />
        <ReminderCard enabled={remindEnabled} time={remindTime} saving={savingPrefs} onSave={handleSavePreferences} />
        <GuideCard />
      </SettingsSection>
      <SettingsSection title="Tài khoản" description="Thông tin người học và cách đăng nhập vào LMS.">
        <AccountCard profile={profile} />
        <PasswordCard />
      </SettingsSection>
      <SettingsSection title="Dữ liệu học tập" description="Xuất một bản để lưu riêng hoặc quản lý các bài bạn đã nộp.">
        <ExportCard />
        <SubmissionsCard submissions={submissions} onDeleted={removeSubmission} />
      </SettingsSection>

      <div className="pt-2">
        <Button
          variant="outline"
          fullWidth
          onClick={() => setSignOutOpen(true)}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <Icon name="log-out" className="h-4 w-4" />
          Đăng xuất khỏi hệ thống
        </Button>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        title="Đăng xuất khỏi English Mini LMS?"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục học."
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
        tone="danger"
        loading={loggingOut}
        onConfirm={handleSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </PageContainer>
  );
}
