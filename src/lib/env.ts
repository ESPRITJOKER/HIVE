/**
 * Client-safe environment access.
 * Only NEXT_PUBLIC_* variables may be read here. Privileged keys live in env.server.ts.
 * Missing configuration is represented explicitly so the UI can show an honest
 * "backend not configured" state instead of crashing or faking data.
 */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
} as const;

export const isSupabaseConfigured = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabaseAnonKey,
);

export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      "HIVE backend is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).",
    );
  }
}
