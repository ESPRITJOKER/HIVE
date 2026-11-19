import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/** Server Supabase client bound to the request's cookie store. Server-only. */
export async function getServerSupabase() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: cookie writes are handled by middleware.
        }
      },
    },
  });
}

/**
 * Privileged server client. NEVER call from a Route Handler that accepts
 * client-controlled filters without first applying server-side authorization.
 * The service-role key bypasses RLS — use only for trusted background jobs.
 */
export async function getAdminSupabase() {
  const { getServerEnv } = await import("@/lib/env.server");
  const env = getServerEnv();
  if (!env) return null;

  return createServerClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => undefined,
    },
  });
}
