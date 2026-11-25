"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthRuntimeError } from "./login-messages";
import { Button, Icon } from "@/components/ui";

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
        // Mọi lỗi Supabase đều qua mapper — không hiển thị raw error tiếng Anh.
        onError(
          mapAuthRuntimeError({
            code: otpError.code,
            message: otpError.message,
          }),
        );
      } else {
        onSent();
      }
    } catch {
      onError("Lỗi gửi link đăng nhập. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="otp-email-input"
          className="mb-2 block text-base font-medium text-text"
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
          className="field-control"
        />
      </div>

      <Button
        type="submit"
        disabled={!email}
        loading={loading}
        fullWidth
        size="lg"
      >
        {loading ? "Đang gửi liên kết..." : "Gửi liên kết đăng nhập"}
      </Button>

      <div className="border-t border-border pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            onError(null);
            onSwitchMode();
          }}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-base font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          Dùng mật khẩu
        </button>
      </div>
    </form>
  );
}
