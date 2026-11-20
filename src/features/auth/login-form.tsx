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
    <p className="mt-3 flex items-start gap-2 text-base leading-relaxed text-text-secondary">
      <Icon name="lightbulb" className="mt-1 h-4 w-4 shrink-0 text-amber-700" />
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
    <div className="flex min-h-dvh items-center justify-center bg-surface-muted px-5 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="mb-8 text-left">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-base font-semibold tracking-wide text-white">
            MD
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            English Mini LMS
          </h1>
          <p className="mt-2 text-base leading-relaxed text-text-secondary">
            Không gian học tiếng Anh cá nhân, 30–45 phút mỗi ngày.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-base leading-relaxed text-red-800"
          >
            <p className="flex items-start gap-2">
              <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </p>
            {showBrowserHint && <BrowserHint />}
          </div>
        )}

        {sent ? (
          <div role="status" className="space-y-4 rounded-xl bg-surface-subtle p-5 text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Icon name="send" className="h-5 w-5" />
            </div>
            <p className="font-bold text-text">Đã gửi link đăng nhập</p>
            <p className="break-words text-base leading-relaxed text-text-secondary">
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
              className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-left text-base font-medium text-primary-dark underline underline-offset-2 hover:text-primary"
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
