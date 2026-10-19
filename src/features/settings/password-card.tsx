"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardHeader } from "@/components/ui";
import { PasswordInput } from "@/features/auth/password-input";

/** Đổi mật khẩu qua supabase.auth.updateUser (client session hiện tại). */
export function PasswordCard() {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    try {
      setChanging(true);
      setMessage(null);
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setMessage({
        type: "success",
        text: "Đã cập nhật mật khẩu mới thành công!",
      });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Không thể cập nhật mật khẩu.",
      });
    } finally {
      setChanging(false);
    }
  }

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Bảo mật & Mật khẩu"
        description="Đổi mật khẩu đăng nhập LMS cho tài khoản này"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen((v) => !v);
              setMessage(null);
            }}
          >
            {open ? "Đóng lại" : "Đổi mật khẩu 🔑"}
          </Button>
        }
      />

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-xl border p-3 text-xs sm:text-sm ${
            message.type === "success"
              ? "border-teal-200 bg-teal-50 text-teal-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? "✅ " : "⚠️ "}
          {message.text}
        </div>
      )}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 border-t border-slate-100 pt-3"
        >
          <div>
            <label
              htmlFor="new-pwd"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Mật khẩu mới (tối thiểu 6 ký tự)
            </label>
            <PasswordInput
              id="new-pwd"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              placeholder="Nhập mật khẩu mới..."
            />
          </div>
          <div>
            <label
              htmlFor="confirm-pwd"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Xác nhận mật khẩu mới
            </label>
            <PasswordInput
              id="confirm-pwd"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu mới..."
            />
          </div>
          <Button
            type="submit"
            fullWidth
            loading={changing}
            disabled={!newPassword || !confirmPassword}
          >
            {changing ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
          </Button>
        </form>
      )}
    </Card>
  );
}
