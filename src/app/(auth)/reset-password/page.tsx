"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/features/authentication/components/password-input";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { updatePassword } from "@/features/authentication/services/auth-service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await updatePassword(values);
    if (!result.ok) {
      toast.error(result.message ?? "Could not update your password.");
      return;
    }
    toast.success("Password updated.");
    router.push(result.redirectTo ?? "/student/dashboard");
    router.refresh();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted">Use at least 8 characters, including a letter and a number.</p>
      </div>

      <ConfigNotice />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="password" label="New password" error={form.formState.errors.password?.message} required>
          <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
        </FormField>
        <FormField
          id="confirmPassword"
          label="Confirm new password"
          error={form.formState.errors.confirmPassword?.message}
          required
        >
          <PasswordInput id="confirmPassword" autoComplete="new-password" {...form.register("confirmPassword")} />
        </FormField>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
