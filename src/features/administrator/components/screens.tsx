"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import {
  createClassAction,
  saveSystemSettingsAction,
  setMembershipStatusAction,
  setRepresentativeAssignmentAction,
  updateUserRoleAction,
} from "../actions/admin-actions";

const selectClass =
  "flex h-11 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-secondary focus-visible:outline-none";

export function RoleSelect({
  userId,
  role,
  currentUserId,
}: {
  userId: string;
  role: string;
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const isSelf = userId === currentUserId;

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Role for ${userId}`}
        className={selectClass}
        value={role}
        disabled={pending || isSelf}
        title={isSelf ? "You cannot change your own role" : undefined}
        onChange={(event) => {
          const nextRole = event.target.value;
          startTransition(async () => {
            const result = await updateUserRoleAction({ userId, role: nextRole });
            if (!result.ok) {
              toast.error(result.message ?? "Role change refused.");
              return;
            }
            toast.success("Role updated and audited.");
          });
        }}
      >
        <option value="student">Student</option>
        <option value="representative">Representative</option>
        <option value="administrator">Administrator</option>
      </select>
      {pending ? <Loader2 className="size-4 animate-spin text-muted" aria-hidden="true" /> : null}
    </div>
  );
}

export function ClassForm() {
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createClassAction({
        name: data.get("name"),
        code: data.get("code"),
        description: data.get("description") || undefined,
      });
      if (!result.ok) {
        toast.error(result.message ?? "Class could not be created.");
        return;
      }
      toast.success("Class created.");
      form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
      <FormField id="class-name" label="Class name" required>
        <Input id="class-name" name="name" maxLength={160} placeholder="e.g. Computer Science 2026" required />
      </FormField>
      <FormField id="class-code" label="Class code" hint="Students use this code to join." required>
        <Input id="class-code" name="code" maxLength={40} placeholder="CS-2026" required />
      </FormField>
      <FormField id="class-description" label="Description" className="sm:col-span-2">
        <Textarea id="class-description" name="description" rows={2} maxLength={500} />
      </FormField>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" aria-hidden="true" />
          {pending ? "Creating…" : "Create class"}
        </Button>
      </div>
    </form>
  );
}

export function MembershipControls({ membershipId }: { membershipId: string }) {
  return (
    <div className="flex justify-end gap-1.5">
      <ConfirmActionButton
        action={setMembershipStatusAction}
        input={{ membershipId, status: "active" }}
        label="Approve"
        variant="ghost"
      />
      <ConfirmActionButton
        action={setMembershipStatusAction}
        input={{ membershipId, status: "rejected" }}
        label="Reject"
        variant="ghost"
        confirm="Reject this membership request?"
      />
    </div>
  );
}

export function AssignRepresentativeForm({
  representatives,
  classes,
}: {
  representatives: Array<{ id: string; label: string }>;
  classes: Array<{ id: string; name: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = React.useState("");
  const [classId, setClassId] = React.useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await setRepresentativeAssignmentAction({ userId, classId, assign: true });
      if (!result.ok) {
        toast.error(result.message ?? "Assignment failed.");
        return;
      }
      toast.success("Representative assigned.");
      setUserId("");
      setClassId("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_1fr_auto]">
      <select aria-label="Representative" className={selectClass} value={userId} onChange={(event) => setUserId(event.target.value)} required>
        <option value="">Select a representative…</option>
        {representatives.map((rep) => (
          <option key={rep.id} value={rep.id}>{rep.label}</option>
        ))}
      </select>
      <select aria-label="Class" className={selectClass} value={classId} onChange={(event) => setClassId(event.target.value)} required>
        <option value="">Select a class…</option>
        {classes.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <Button type="submit" disabled={pending || representatives.length === 0 || classes.length === 0}>
        {pending ? "Assigning…" : "Assign"}
      </Button>
    </form>
  );
}

export function RemoveRepresentativeButton({ userId, classId }: { userId: string; classId: string }) {
  return (
    <ConfirmActionButton
      action={setRepresentativeAssignmentAction}
      input={{ userId, classId, assign: false }}
      label="Remove"
      variant="ghost"
      confirm="Remove this representative assignment?"
    />
  );
}

export function SystemSettingsForm({ maxUploadMb }: { maxUploadMb: number }) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = React.useState(maxUploadMb);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSystemSettingsAction({ maxUploadMb: value });
      if (!result.ok) {
        toast.error(result.message ?? "Settings could not be saved.");
        return;
      }
      toast.success("Settings saved to the database.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5 rounded-2xl border border-border bg-surface p-5">
      <FormField
        id="max-upload"
        label="Maximum document upload (MB)"
        hint="Applies to every representative upload. The 25 MB platform hard cap cannot be exceeded."
        required
      >
        <Input
          id="max-upload"
          type="number"
          min={1}
          max={25}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          required
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="size-4" aria-hidden="true" />
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
