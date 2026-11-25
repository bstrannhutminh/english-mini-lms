import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session-proxy";

/**
 * Next.js 16 "proxy" (tên mới của middleware convention — xem
 * node_modules/next/dist/docs/.../proxy.md). Chỉ chạy runtime Node.js.
 * Nhiệm vụ duy nhất: refresh Supabase session + chặn route cần đăng nhập.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes tự enforce auth qua withLearner/withAdmin — chạy
     *   proxy ở đây chỉ thêm 1 auth roundtrip getUser() trùng lặp; refresh
     *   cookie vẫn diễn ra trong route handler vì Next cho set cookie ở đó)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
