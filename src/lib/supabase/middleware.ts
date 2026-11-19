import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Refreshes the auth session on every request and rewrites cookies onto the
 * response. Must run before any route guard that reads the session.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch the session so Supabase can refresh expiring tokens.
  await supabase.auth.getUser();

  return response;
}
