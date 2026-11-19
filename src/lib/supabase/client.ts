import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Browser Supabase client.
 * Returns null when Supabase is not configured so screens can render an explicit
 * configuration state instead of crashing — this is NOT a mock data source.
 */
export function getBrowserSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  if (!cachedClient) {
    cachedClient = createBrowserClient<Database>(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
    );
  }
  return cachedClient;
}
