"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "./password-input";
import { Button } from "@/components/ui";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email-input"
          className="mb-2 block text-base font-medium text-text"
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
          className="field-control"
        />
      </div>

      <div>
        <label
          htmlFor="password-input"
          className="mb-2 block text-base font-medium text-text"
        >
          Mật khẩu
        </label>
        <PasswordInput
          id="password-input"
          value={password}
          onChange={setPassword}
        />
      </div>

      <Button
        type="submit"
        disabled={!email || !password}
        loading={loading}
        fullWidth
        size="lg"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="border-t border-border pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            onError(null);
            onSwitchMode();
          }}
          className="inline-flex min-h-11 cursor-pointer items-center text-base font-medium text-text-secondary transition-colors hover:text-primary"
        >
          Đăng nhập bằng liên kết email
        </button>
      </div>
    </form>
  );
}
