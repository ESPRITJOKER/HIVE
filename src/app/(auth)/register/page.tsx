"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/features/authentication/components/password-input";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signUp } from "@/features/authentication/services/auth-service";

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", classCode: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await signUp(values);
    if (!result.ok) {
      toast.error(result.message ?? "Could not create your account.");
      return;
    }
    if (result.message) toast.info(result.message);
    else toast.success("Account created. Your class request is pending approval.");
    router.push(result.redirectTo ?? "/pending");
    router.refresh();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Join HIVE</h1>
        <p className="mt-2 text-sm text-muted">Create your student account with a class code.</p>
      </div>

      <ConfigNotice />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="fullName" label="Full name" error={form.formState.errors.fullName?.message} required>
          <Input id="fullName" autoComplete="name" placeholder="Ada Lovelace" {...form.register("fullName")} />
        </FormField>

        <FormField id="email" label="Email address" error={form.formState.errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="you@university.edu" {...form.register("email")} />
        </FormField>

        <FormField
          id="classCode"
          label="Class code"
          error={form.formState.errors.classCode?.message}
          hint="Ask your class representative for this code."
          required
        >
          <Input id="classCode" placeholder="HIVE-DEMO" className="uppercase" {...form.register("classCode")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="password" label="Password" error={form.formState.errors.password?.message} required>
            <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
          </FormField>
          <FormField
            id="confirmPassword"
            label="Confirm password"
            error={form.formState.errors.confirmPassword?.message}
            required
          >
            <PasswordInput id="confirmPassword" autoComplete="new-password" {...form.register("confirmPassword")} />
          </FormField>
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-secondary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
