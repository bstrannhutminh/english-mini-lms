"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { MagicLinkForm } from "./magic-link-form";
import { PasswordLoginForm } from "./password-login-form";

interface LoginFormProps {
  initialError?: string | null;
  showBrowserHint?: boolean;
}

function BrowserHint() {
  return (
    <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-text-secondary">
      <Icon name="lightbulb" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
      <span>
        Liên kết đăng nhập chỉ hoạt động khi mở bằng{" "}
        <strong>đúng trình duyệt đã bấm &ldquo;Gửi link&rdquo;</strong>{" "}
        (Safari/Chrome trên máy này). Nếu mở trong Zalo bị lỗi, hãy quay lại và
        đăng nhập bằng mật khẩu.
      </span>
    </p>
  );
}

/** Khung trang đăng nhập Medical Clean — ghép header, hộp lỗi và 2 form đăng nhập. */
export function LoginForm({ initialError, showBrowserHint }: LoginFormProps) {
  const [mode, setMode] = useState<"password" | "magic_link">("password");
  const [email, setEmail] = useState("nhutminh1989@gmail.com");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-pop sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold tracking-wider text-white shadow-sm">
            MD
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            English Mini LMS
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Học tiếng Anh y khoa 30–45 phút mỗi ngày — vào là học
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-relaxed text-red-700"
          >
            <p className="flex items-start gap-2">
              <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </p>
            {showBrowserHint && <BrowserHint />}
          </div>
        )}

        {sent ? (
          <div className="space-y-3 rounded-2xl border border-teal-200 bg-teal-50/60 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Icon name="send" className="h-5 w-5" />
            </div>
            <p className="font-bold text-text">Đã gửi link đăng nhập</p>
            <p className="text-sm text-text-secondary">
              Kiểm tra hộp thư <strong>{email}</strong> và bấm vào liên kết để
              vào học.
            </p>
            <div className="text-left">
              <BrowserHint />
            </div>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setMode("password");
              }}
              className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-1 text-sm font-semibold text-primary-dark underline underline-offset-2 hover:text-primary"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              Quay lại đăng nhập bằng mật khẩu
            </button>
          </div>
        ) : mode === "password" ? (
          <PasswordLoginForm
            email={email}
            onEmailChange={setEmail}
            onError={setError}
            onSwitchMode={() => setMode("magic_link")}
          />
        ) : (
          <>
            <MagicLinkForm
              email={email}
              onEmailChange={setEmail}
              onError={setError}
              onSent={() => setSent(true)}
              onSwitchMode={() => setMode("password")}
            />
            <BrowserHint />
          </>
        )}
      </div>
    </div>
  );
}
