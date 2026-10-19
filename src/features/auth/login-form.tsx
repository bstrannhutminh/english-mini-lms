"use client";

import { useState } from "react";
import { MagicLinkForm } from "./magic-link-form";
import { PasswordLoginForm } from "./password-login-form";

interface LoginFormProps {
  /** Thông báo lỗi đã map từ ?error/?reason/?message (server page truyền vào). */
  initialError?: string | null;
  /** true khi lỗi liên quan magic link → hiện gợi ý mở bằng trình duyệt chính. */
  showBrowserHint?: boolean;
}

/**
 * Gợi ý PKCE: mã xác minh (code_verifier) chỉ nằm trong trình duyệt đã bấm
 * "Gửi link". Mở link từ trình duyệt trong app (Zalo, Facebook…) hoặc trình
 * duyệt khác → xác thực thất bại. Phải mở bằng đúng trình duyệt chính
 * (Safari/Chrome) đã gửi yêu cầu.
 */
function BrowserHint() {
  return (
    <p className="mt-2 text-xs leading-relaxed text-slate-500">
      💡 Lưu ý: liên kết đăng nhập chỉ hoạt động khi mở bằng{" "}
      <strong>đúng trình duyệt đã bấm “Gửi link”</strong> (Safari/Chrome trên
      máy này). Nếu mail mở trong Zalo hay app khác mà bị lỗi, hãy quay lại
      trang này và đăng nhập bằng mật khẩu hoặc gửi lại link mới.
    </p>
  );
}

/** Khung trang đăng nhập — ghép header, hộp lỗi và 2 form (mật khẩu/magic link). */
export function LoginForm({ initialError, showBrowserHint }: LoginFormProps) {
  const [mode, setMode] = useState<"password" | "magic_link">("password");
  const [email, setEmail] = useState("nhutminh1989@gmail.com");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        {/* Header / Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-2xl text-white shadow-md shadow-teal-500/20">
            📚
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            English Mini LMS
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Học tiếng Anh 30–45 phút mỗi ngày dành cho BS. Minh
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700 sm:text-sm"
          >
            <p>⚠️ {error}</p>
            {showBrowserHint && <BrowserHint />}
          </div>
        )}

        {/* Màn hình Thành công khi gửi Magic link */}
        {sent ? (
          <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-6 text-center">
            <div className="text-3xl">✉️</div>
            <p className="font-semibold text-teal-900">Đã gửi link đăng nhập!</p>
            <p className="text-sm text-teal-700">
              Vui lòng kiểm tra hộp thư <strong>{email}</strong> và bấm vào liên
              kết để vào học.
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
              className="mt-3 text-xs font-semibold text-teal-700 underline hover:text-teal-900"
            >
              ← Quay lại đăng nhập bằng mật khẩu
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
