import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { HOME_PATH } from "@/lib/permissions/roles";
import type { Role } from "@/types/domain";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "";

  // Open-redirect guard: only same-origin absolute paths are accepted.
  const safeNext =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/student/dashboard";

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}/login?reason=not_configured`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/verify?error=missing_code`);
  }

  // Collect Set-Cookie calls from Supabase and apply them to the final response.
  let pendingCookies: Array<{ name: string; value: string; options?: Record<string, unknown> }> = [];

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies = cookiesToSet;
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/verify?error=exchange_failed`);
  }

  let destination = safeNext;
  if (safeNext === "/student/dashboard") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role) destination = HOME_PATH[profile.role as Role] ?? destination;
    }
  }

  const response = NextResponse.redirect(`${origin}${destination}`);
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options as never);
  }
  return response;
}
