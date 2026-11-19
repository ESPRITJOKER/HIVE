import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";
import { HOME_PATH } from "@/lib/permissions/roles";
import type { Role } from "@/types/domain";

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/onboarding",
  "/join-class",
  "/pending",
  "/splash",
  "/auth",
  "/manifest.webmanifest",
  "/sw.js",
  "/icons",
];

const ROLE_PREFIXES: Record<string, Role> = {
  "/student": "student",
  "/representative": "representative",
  "/admin": "administrator",
};

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return response;
  }

  const area = Object.keys(ROLE_PREFIXES).find((prefix) => pathname.startsWith(prefix));
  if (!area) return response;

  const loginRedirect = (reason: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("reason", reason);
    return NextResponse.redirect(url);
  };

  if (!isSupabaseConfigured) return loginRedirect("not_configured");

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => undefined,
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return loginRedirect("auth_required");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  const requiredRole = ROLE_PREFIXES[area];
  if (profile.role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_PATH[profile.role as Role] ?? "/student/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
