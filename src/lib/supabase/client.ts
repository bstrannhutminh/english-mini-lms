import { createBrowserClient } from "@supabase/ssr";
import { EnvError } from "@/lib/env";

/**
 * Browser Supabase client. Reads static NEXT_PUBLIC_* references so Next.js
 * inlines them into the client bundle, and throws EnvError if missing.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) throw new EnvError(missing);

  return createBrowserClient(url!, anonKey!);
}
