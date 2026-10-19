"use client";

import { useState } from "react";
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
  Skeleton,
  useToast,
} from "@/components/ui";
import { useSettingsData } from "./use-settings-data";
import { AccountCard } from "./account-card";
import { PasswordCard } from "./password-card";
import { ReminderCard } from "./reminder-card";
import { GuideCard } from "./guide-card";
import { ExportCard } from "./export-card";
import { SubmissionsCard } from "./submissions-card";

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

  // Đăng xuất — ConfirmDialog thay window.confirm
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSavePreferences(
    nextEnabled: boolean,
    nextTime: string
  ): Promise<boolean> {
    setReminders(nextEnabled, nextTime);
    try {
      setSavingPrefs(true);
      const patch: PreferencesPatch = {
        remindEnabled: nextEnabled,
        remindTime: nextTime,
      };
      await apiFetch(
        "/api/v1/settings/preferences",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferencesPatchSchema.parse(patch)),
        },
        preferencesResponseSchema
      );
      return true;
    } catch (err) {
      toast.error(
        "Không thể lưu cài đặt",
        err instanceof ApiClientError ? err.message : undefined
      );
      return false;
    } finally {
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
      <div className="mx-auto max-w-xl space-y-6 px-4 py-6 pb-24">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6 pb-24">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt</h1>
        <p className="text-sm text-slate-500">
          Quản lý tài khoản, dữ liệu học tập và thông báo
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={reload}>
            Thử lại
          </Button>
        </div>
      )}

      <AccountCard profile={profile} />
      <PasswordCard />
      <ReminderCard
        enabled={remindEnabled}
        time={remindTime}
        saving={savingPrefs}
        onSave={handleSavePreferences}
      />
      <GuideCard />
      <ExportCard />
      <SubmissionsCard submissions={submissions} onDeleted={removeSubmission} />

      <div className="pt-2">
        <Button
          variant="outline"
          fullWidth
          onClick={() => setSignOutOpen(true)}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          🚪 Đăng xuất khỏi hệ thống
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
    </div>
  );
}
