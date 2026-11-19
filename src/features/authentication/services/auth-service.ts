"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { HOME_PATH } from "@/lib/permissions/roles";
import type { Role } from "@/types/domain";
import { publicEnv } from "@/lib/env";
import type {
  ForgotPasswordInput,
  JoinClassInput,
  LoginInput,
  OnboardingInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";

export interface AuthResult {
  ok: boolean;
  message?: string;
  redirectTo?: string;
}

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  message:
    "The HIVE backend is not configured yet. Set your Supabase credentials in .env.local (see .env.example).",
};

function failure(message: string): AuthResult {
  return { ok: false, message };
}

/** Resolves the database-backed role and the appropriate home route. */
export async function resolveLandingRoute(): Promise<string> {
  const supabase = getBrowserSupabase();
  if (!supabase) return "/login?reason=not_configured";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";

  const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();

  if (!data) return "/onboarding";

  const role = data.role as Role;
  return HOME_PATH[role] ?? "/student/dashboard";
}

export async function signIn(input: LoginInput): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return failure(error.message);

  return { ok: true, redirectTo: await resolveLandingRoute() };
}

export async function signUp(input: RegisterInput): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
      emailRedirectTo: `${publicEnv.appUrl}/auth/callback?next=/join-class`,
    },
  });
  if (error) return failure(error.message);
  if (!data.user) return failure("We could not create your account. Please try again.");

  // Joining is performed through a definer function — clients cannot write memberships directly.
  const { error: joinError } = await supabase.rpc("join_class", { p_code: input.classCode });
  if (joinError) {
    return failure(
      `Account created, but the class code "${input.classCode}" was not recognised. Join a class from your profile.`,
    );
  }

  if (data.session) return { ok: true, redirectTo: "/pending" };
  return {
    ok: true,
    message: "Check your inbox to verify your email address, then sign in.",
    redirectTo: "/login?reason=check_email",
  };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${publicEnv.appUrl}/auth/callback` },
  });
  if (error) return failure(error.message);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${publicEnv.appUrl}/auth/callback?next=/reset-password`,
  });
  if (error) return failure(error.message);
  return { ok: true, message: "If that address is registered, a reset link is on its way." };
}

export async function updatePassword(input: ResetPasswordInput): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) return failure(error.message);
  return { ok: true, message: "Password updated.", redirectTo: "/student/dashboard" };
}

export async function joinClass(input: JoinClassInput): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.rpc("join_class", { p_code: input.classCode });
  if (error) return failure(error.message || "That class code was not recognised.");
  return { ok: true, message: "Request sent. Awaiting representative approval.", redirectTo: "/pending" };
}

export async function completeOnboarding(input: OnboardingInput): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return failure("Your session expired. Please sign in again.");

  const { error } = await supabase
    .from("users")
    .update({ full_name: input.fullName })
    .eq("id", user.id);
  if (error) return failure(error.message);
  return { ok: true, redirectTo: "/join-class" };
}
