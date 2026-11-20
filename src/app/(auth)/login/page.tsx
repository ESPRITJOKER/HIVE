"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { PasswordInput } from "@/features/authentication/components/password-input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn, signInWithGoogle } from "@/features/authentication/services/auth-service";
import { isSupabaseConfigured } from "@/lib/env";

export default function LoginPage(props: { searchParams: Promise<{ reason?: string }> }) {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = React.useState(false);

  // Read the redirect reason from the server-provided searchParams promise
  // instead of synchronously setting state inside an effect.
  const params = React.use(props.searchParams);
  const notice: string | null =
    params.reason === "check_email"
      ? "Check your inbox to verify your email before signing in."
      : params.reason === "auth_required"
        ? "Sign in to continue to your academic workspace."
        : params.reason === "not_configured"
          ? "Connect Supabase to enable sign-in."
          : null;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await signIn(values);
    if (!result.ok) {
      toast.error(result.message ?? "Could not sign in.");
      return;
    }
    toast.success("Welcome back to HIVE.");
    router.push(result.redirectTo ?? "/student/dashboard");
    router.refresh();
  });

  async function handleGoogle() {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.ok) toast.error(result.message ?? "Google sign-in failed.");
    setGoogleLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to continue learning together.</p>
      </div>

      <ConfigNotice />

      {notice ? (
        <p role="status" className="rounded-md border border-info/40 bg-info/10 p-3 text-sm text-info">
          {notice}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="email" label="Email address" error={form.formState.errors.email?.message} required>
          <Input
            id="email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@university.edu"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </FormField>

        <FormField id="password" label="Password" error={form.formState.errors.password?.message} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </FormField>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-secondary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={googleLoading || !isSupabaseConfigured}
      >
        <Globe aria-hidden="true" />
        {googleLoading ? "Connecting…" : "Continue with Google"}
      </Button>

      <p className="text-center text-sm text-muted">
        New to HIVE?{" "}
        <Link href="/register" className="font-semibold text-secondary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
