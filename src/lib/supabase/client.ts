import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

/**
 * Browser Supabase client. Validates env at call time (client-side render)
 * — throws EnvError naming the missing variables in Vietnamese.
 */
export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    requireEnv(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
