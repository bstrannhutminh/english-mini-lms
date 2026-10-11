"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic_link">("password");
  const [email, setEmail] = useState("nhutminh1989@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            ⚠️ {error}
          </div>
        )}

        {/* 1. Màn hình Thành công khi gửi Magic link */}
        {sent ? (
          <div className="text-center p-6 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
            <div className="text-3xl">✉️</div>
            <p className="font-semibold text-teal-900">
              Đã gửi link đăng nhập!
            </p>
            <p className="text-sm text-teal-700">
              Vui lòng kiểm tra hộp thư <strong>{email}</strong> và bấm vào liên kết để vào học.
            </p>
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full min-h-[44px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang gửi link...</span>
                </>
              ) : (
                "Gửi link đăng nhập qua Email"
              )}
            </button>

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

