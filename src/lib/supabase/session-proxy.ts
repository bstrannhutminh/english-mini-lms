import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * updateSession(request) — chạy trong src/proxy.ts (Next 16 "proxy", Node.js
 * runtime). Làm mới auth cookie qua supabase.auth.getUser() rồi quyết định
 * cho qua / chuyển hướng.
 *
 * BUG đã vá (kien-truc §5.5): trước đây khi redirect/401, code trả về một
 * NextResponse MỚI → làm rơi các cookie phiên vừa được refresh ghi trên
 * `supabaseResponse` (session hết hạn → đá về /login với cookie cũ → login
 * lặp vô tận). Nay mọi response rời khỏi đây đều đi qua `withSessionCookies`
 * để sao chép Set-Cookie đã phát hành.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Env missing → let the request through unauthenticated. Pages render their
  // own error boundaries and API routes return proper 401/503 via helpers —
  // crashing here would take down the whole site during a misconfig.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * Trả về `response` kèm theo mọi cookie phiên vừa được refresh trên
   * `supabaseResponse`. KHÔNG BAO GIỜ trả response trần — mất cookie mới.
   */
  function withSessionCookies(response: NextResponse): NextResponse {
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return response;
  }

  function redirectTo(pathname: string): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    return withSessionCookies(NextResponse.redirect(url));
  }

  // Public routes that don't require auth. manifest/sw phải public để PWA
  // cài đặt/đăng ký hoạt động kể cả khi chưa đăng nhập.
  const publicPaths = [
    "/login",
    "/auth/callback",
    "/api/v1/health",
    "/manifest.json",
    "/sw.js",
  ];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Allow dev bypass when DEV_BYPASS_AUTH=true in development
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true";

  if (!user && !isPublicPath && !isDevBypass) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return withSessionCookies(
        NextResponse.json(
          {
            error: {
              code: "unauthorized",
              message: "Chưa đăng nhập — vui lòng đăng nhập lại.",
            },
          },
          { status: 401 }
        )
      );
    }
    return redirectTo("/login");
  }

  // If logged in and trying to access login, redirect to /today
  if (user && request.nextUrl.pathname === "/login") {
    return redirectTo("/today");
  }

  return supabaseResponse;
}
