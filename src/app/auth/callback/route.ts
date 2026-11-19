import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback — đổi `code` (PKCE từ magic link) lấy session.
 * Thất bại → redirect về /login kèm mã lỗi đọc được:
 *   - missing_code: link thiếu/không có code
 *   - exchange_failed + reason=<mã Supabase>: xác thực code lỗi
 * login/page.tsx map các mã này sang thông báo tiếng Việt.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/today";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Mang theo mã lỗi Supabase (otp_expired, ...) để login giải thích đúng.
  const reason = "code" in error && error.code ? String(error.code) : "unknown";
  const url = `${origin}/login?error=exchange_failed&reason=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url);
}
