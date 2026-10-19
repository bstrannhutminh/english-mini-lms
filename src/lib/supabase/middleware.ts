import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Public routes that don't require auth
  const publicPaths = ["/login", "/auth/callback", "/api/v1/health"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Allow dev bypass when DEV_BYPASS_AUTH=true in development
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true";

  if (!user && !isPublicPath && !isDevBypass) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login, redirect to /today
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
