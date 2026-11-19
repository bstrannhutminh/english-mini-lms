"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MagicLinkFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onError: (message: string | null) => void;
  /** Đã gửi link thành công → container hiện màn hình "Đã gửi". */
  onSent: () => void;
  /** Quay lại form mật khẩu. */
  onSwitchMode: () => void;
}

/**
 * Form magic link (signInWithOtp → emailRedirectTo /auth/callback).
 * PKCE: code_verifier chỉ nằm trong trình duyệt gửi yêu cầu — link phải mở
 * bằng đúng trình duyệt đó (không phải trình duyệt trong Zalo/Facebook).
 */
export function MagicLinkForm({
  email,
  onEmailChange,
  onError,
  onSent,
  onSwitchMode,
}: MagicLinkFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onError("Vui lòng nhập địa chỉ email.");
      return;
    }

    setLoading(true);
    onError(null);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setLoading(false);
      if (otpError) {
        onError(otpError.message);
      } else {
        onSent();
      }
    } catch {
      onError("Lỗi gửi link đăng nhập. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="otp-email-input"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Email nhận liên kết
        </label>
        <input
          id="otp-email-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="bacsi.minh@email.com"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm transition focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Đang gửi link...</span>
          </>
        ) : (
          "Gửi link đăng nhập qua Email"
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
          ← Quay lại đăng nhập bằng Mật khẩu
        </button>
      </div>
    </form>
  );
}
