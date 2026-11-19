"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { joinClassSchema, type JoinClassInput } from "@/lib/validations/auth";
import { joinClass } from "@/features/authentication/services/auth-service";

export default function JoinClassPage() {
  const router = useRouter();
  const form = useForm<JoinClassInput>({
    resolver: zodResolver(joinClassSchema),
    defaultValues: { classCode: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await joinClass(values);
    if (!result.ok) {
      toast.error(result.message ?? "Could not join that class.");
      return;
    }
    toast.success(result.message ?? "Request sent.");
    router.push(result.redirectTo ?? "/pending");
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">Step 2 of 2</p>
        <h1 className="text-3xl font-extrabold">Join your class</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the code shared by your class representative. Membership is approved by a representative.
        </p>
      </div>

      <ConfigNotice />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="classCode" label="Class code" error={form.formState.errors.classCode?.message} required>
          <Input
            id="classCode"
            placeholder="HIVE-DEMO"
            className="uppercase tracking-widest"
            {...form.register("classCode")}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending request…" : "Request to join"}
        </Button>
      </form>

      <p className="text-xs leading-relaxed text-muted">
        Students cannot approve their own membership. This protects class data from unauthorised access.
      </p>
    </div>
  );
}
