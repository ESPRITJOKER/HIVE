"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { updateProfileAction } from "../actions/profile-actions";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [fullName, setFullName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  const changed = fullName.trim() !== initialName;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateProfileAction({ fullName });
      if (!result.ok) {
        toast.error(result.message ?? "Could not save your profile.");
        return;
      }
      toast.success(result.message ?? "Profile updated.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField id="fullName" label="Display name" required hint="Shown to your classmates and representatives.">
        <Input
          id="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          minLength={1}
          maxLength={120}
          required
        />
      </FormField>
      <Button type="submit" disabled={pending || !changed || fullName.trim().length === 0}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Save changes
      </Button>
    </form>
  );
}
