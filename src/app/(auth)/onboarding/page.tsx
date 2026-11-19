"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth";
import { completeOnboarding } from "@/features/authentication/services/auth-service";

export default function OnboardingPage() {
  const router = useRouter();
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { fullName: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await completeOnboarding(values);
    if (!result.ok) {
      toast.error(result.message ?? "Could not save your profile.");
      return;
    }
    router.push(result.redirectTo ?? "/join-class");
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">Step 1 of 2</p>
        <h1 className="text-3xl font-extrabold">Welcome to HIVE</h1>
        <p className="mt-2 text-sm text-muted">Tell us what your classmates should call you.</p>
      </div>

      <ConfigNotice />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="fullName" label="Full name" error={form.formState.errors.fullName?.message} required>
          <Input id="fullName" autoComplete="name" placeholder="Ada Lovelace" {...form.register("fullName")} />
        </FormField>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Continue
        </Button>
      </form>
    </div>
  );
}
