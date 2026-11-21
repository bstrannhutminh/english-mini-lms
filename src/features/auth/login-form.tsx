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
    <main className="grid min-h-dvh bg-surface-muted lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-border bg-surface-subtle p-12 lg:flex xl:p-16" aria-label="Không gian học cá nhân">
        <p className="flex items-center gap-3 text-base font-semibold text-primary-dark">
          <Icon name="book-open" className="h-6 w-6" />English Mini LMS
        </p>
        <div className="my-12 max-w-lg">
          <p className="text-base font-medium text-primary-dark">30–45 phút dành cho chính mình</p>
          <h2 className="mt-5 text-5xl font-semibold leading-tight tracking-tight text-text">Tiếng Anh cho những điều bạn muốn làm.</h2>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-text-secondary">Từ giao tiếp công việc đến đọc tài liệu y khoa. Luyện một bài, xem góp ý, rồi thử lại theo nhịp của bạn.</p>
        </div>
        <p className="border-t border-border pt-6 text-base text-text-secondary">Nghe · Nói · Đọc · Viết</p>
      </aside>
      <div className="flex min-w-0 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <header className="mb-8 text-left">
            <p className="mb-5 flex items-center gap-2 text-base font-medium text-primary-dark lg:hidden"><Icon name="book-open" className="h-5 w-5" />English Mini LMS</p>
            <h1 className="text-3xl font-semibold tracking-tight text-text">Trở lại góc học tập</h1>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">Đăng nhập để tiếp tục bài học của bạn.</p>
          </header>

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
    </main>
  );
}
