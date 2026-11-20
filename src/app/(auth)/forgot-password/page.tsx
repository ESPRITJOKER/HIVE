"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { EnvelopeArt } from "@/features/authentication/components/brand-illustration";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/features/authentication/services/auth-service";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await requestPasswordReset(values);
    if (!result.ok) {
      toast.error(result.message ?? "Could not send a reset link.");
      return;
    }
    toast.success(result.message ?? "Reset link sent.");
    setSent(true);
  });

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <EnvelopeArt className="mx-auto" />
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-extrabold">Check your email!</h1>
          <p className="text-sm text-muted">
            We&apos;ve sent a secure password reset link to{" "}
            <span className="font-medium text-foreground">{form.getValues("email")}</span>.
          </p>
        </div>
        <div className="space-y-3">
          <Button type="button" variant="outline" className="w-full" onClick={() => setSent(false)}>
            Use a different email
          </Button>
          <Link href="/login" className="block text-sm font-semibold text-secondary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <ConfigNotice />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="email" label="Email address" error={form.formState.errors.email?.message} required>
          <Input id="email" type="email" icon={Mail} autoComplete="email" placeholder="you@university.edu" {...form.register("email")} />
        </FormField>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-secondary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
