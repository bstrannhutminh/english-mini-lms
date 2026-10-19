"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "./password-input";

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

export function LoginForm({ initialError, showBrowserHint }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic_link">("password");
  const [email, setEmail] = useState("nhutminh1989@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setError(null);

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
          setError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
        } else if (
          signInError.message.toLowerCase().includes("email not confirmed")
        ) {
          setError("Tài khoản chưa được kích hoạt xác nhận email.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Đăng nhập thành công -> chuyển thẳng tới trang Hôm nay
      router.push("/today");
      router.refresh();
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (otpError) {
        setError(otpError.message);
        setLoading(false);
      } else {
        setSent(true);
        setLoading(false);
      }
    } catch {
      setError("Lỗi gửi link đăng nhập. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const spinner = (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/50">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/20 text-2xl">
            📚
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            English Mini LMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Học tiếng Anh 30–45 phút mỗi ngày dành cho BS. Minh
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 leading-relaxed"
          >
            <p>⚠️ {error}</p>
            {showBrowserHint && <BrowserHint />}
          </div>
        )}

        {/* 1. Màn hình Thành công khi gửi Magic link */}
        {sent ? (
          <div className="text-center p-6 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
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
              className="mt-3 text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
            >
              ← Quay lại đăng nhập bằng mật khẩu
            </button>
          </div>
        ) : mode === "password" ? (
          /* 2. Form Đăng nhập bằng Mật khẩu (Mặc định) */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email đăng nhập
              </label>
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bacsi.minh@email.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
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
              className="w-full min-h-[44px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  {spinner}
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("magic_link");
                }}
                className="text-xs text-slate-500 hover:text-teal-700 font-medium transition"
              >
                Hoặc đăng nhập bằng liên kết gửi qua Email (Magic Link)
              </button>
            </div>
          </form>
        ) : (
          /* 3. Form Đăng nhập bằng Magic Link (Dự phòng) */
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div>
              <label
                htmlFor="otp-email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email nhận liên kết
              </label>
              <input
                id="otp-email-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bacsi.minh@email.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full min-h-[44px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  {spinner}
                  <span>Đang gửi link...</span>
                </>
              ) : (
                "Gửi link đăng nhập qua Email"
              )}
            </button>

            <BrowserHint />

            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("password");
                }}
                className="text-xs text-slate-500 hover:text-teal-700 font-medium transition"
              >
                ← Quay lại đăng nhập bằng Mật khẩu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
