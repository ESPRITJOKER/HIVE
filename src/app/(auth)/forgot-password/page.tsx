"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/features/authentication/services/auth-service";

export default function ForgotPasswordPage() {
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
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <ConfigNotice />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="email" label="Email address" error={form.formState.errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
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
