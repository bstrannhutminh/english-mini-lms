"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "./password-input";

interface PasswordLoginFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  /** Báo lỗi lên container để hiển thị chung một hộp thông báo. */
  onError: (message: string | null) => void;
  /** Chuyển sang form magic link. */
  onSwitchMode: () => void;
}

/** Form đăng nhập email + mật khẩu (mặc định). */
export function PasswordLoginForm({
  email,
  onEmailChange,
  onError,
  onSwitchMode,
}: PasswordLoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    onError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (
          signInError.message.toLowerCase().includes("invalid login credentials")
        ) {
          onError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
        } else if (
          signInError.message.toLowerCase().includes("email not confirmed")
        ) {
          onError("Tài khoản chưa được kích hoạt xác nhận email.");
        } else {
          onError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Đăng nhập thành công -> chuyển thẳng tới trang Hôm nay
      router.push("/today");
      router.refresh();
    } catch {
      onError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email-input"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Email đăng nhập
        </label>
        <input
          id="email-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="bacsi.minh@email.com"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm transition focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="password-input"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Mật khẩu
        </label>
        <PasswordInput
          id="password-input"
          value={password}
          onChange={setPassword}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>

      <div className="border-t border-slate-100 pt-3 text-center">
        <button
          type="button"
          onClick={() => {
            onError(null);
            onSwitchMode();
          }}
          className="text-xs font-medium text-slate-500 transition hover:text-teal-700"
        >
          Hoặc đăng nhập bằng liên kết gửi qua Email (Magic Link)
        </button>
      </div>
    </form>
  );
}
