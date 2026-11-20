"use client";

import * as React from "react";
import { useTransition } from "react";
import { FileUp, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import {
  DAY_LABELS,
  DAY_ORDER,
  SLOT_TYPE_LABELS,
  TASK_CATEGORY_LABELS,
} from "@/lib/constants";
import type { CourseOption } from "../services/representative-service";
import {
  createAssignmentAction,
  createDocumentLinkAction,
  createTimetableSlotAction,
  setMessageModerationAction,
  uploadDocumentAction,
} from "../actions/representative-actions";

const selectClass =
  "flex h-11 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-secondary focus-visible:outline-none";

function CourseSelect({
  courses,
  value,
  onChange,
  id = "course",
}: {
  courses: CourseOption[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Select a course…</option>
      {courses.map((course) => (
        <option key={course.id} value={course.id}>
          {course.label}
        </option>
      ))}
    </select>
  );
}

function EmptyCourses({ courses }: { courses: CourseOption[] }) {
  if (courses.length > 0) return null;
  return (
    <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
      No courses are available in the classes you manage. An administrator must create a class, course and your
      representative assignment first.
    </p>
  );
}

export function UploadDocumentForm({ courses }: { courses: CourseOption[] }) {
  const [pending, startTransition] = useTransition();
  const [courseId, setCourseId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      toast.error("Choose a document first.");
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData();
    formData.set("courseId", courseId);
    formData.set("title", title);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadDocumentAction(formData);
      if (!result.ok) {
        toast.error(result.message ?? "Upload failed.");
        return;
      }
      toast.success("Document uploaded and queued for processing.");
      setTitle("");
      setFile(null);
      form.reset();
      setCourseId("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <FileUp className="size-4 text-secondary" aria-hidden="true" /> Upload a file
      </div>
      <EmptyCourses courses={courses} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="upload-course" label="Course" required>
          <CourseSelect courses={courses} value={courseId} onChange={setCourseId} id="upload-course" />
        </FormField>
        <FormField id="upload-title" label="Title" required>
          <Input id="upload-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Lecture 04 — Graphs" maxLength={200} required />
        </FormField>
      </div>
      <FormField id="upload-file" label="Document" hint="PDF, DOCX, PPTX, TXT or MD. Content is checked on the server." required>
        <Input
          id="upload-file"
          type="file"
          accept=".pdf,.docx,.pptx,.txt,.md"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          required
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || courses.length === 0}>
          {pending ? "Uploading…" : "Upload document"}
        </Button>
      </div>
    </form>
  );
}

export function LinkDocumentForm({ courses }: { courses: CourseOption[] }) {
  const [pending, startTransition] = useTransition();
  const [courseId, setCourseId] = React.useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createDocumentLinkAction({
        courseId,
        title: data.get("title"),
        driveUrl: data.get("driveUrl"),
      });
      if (!result.ok) {
        toast.error(result.message ?? "Could not add the link.");
        return;
      }
      toast.success("Reference added.");
      form.reset();
      setCourseId("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Link2 className="size-4 text-secondary" aria-hidden="true" /> Link an external reference
      </div>
      <EmptyCourses courses={courses} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="link-course" label="Course" required>
          <CourseSelect courses={courses} value={courseId} onChange={setCourseId} id="link-course" />
        </FormField>
        <FormField id="link-title" label="Title" required>
          <Input id="link-title" name="title" placeholder="e.g. Official course outline" maxLength={200} required />
        </FormField>
      </div>
      <FormField id="link-url" label="HTTPS URL" required>
        <Input id="link-url" name="driveUrl" type="url" placeholder="https://…" required />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={pending || courses.length === 0}>
          {pending ? "Adding…" : "Add reference"}
        </Button>
      </div>
    </form>
  );
}

export function TimetableSlotForm({ courses }: { courses: CourseOption[] }) {
  const [pending, startTransition] = useTransition();
  const [courseId, setCourseId] = React.useState("");
  const [day, setDay] = React.useState<string>("monday");
  const [type, setType] = React.useState<string>("lecture_cm");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createTimetableSlotAction({
        courseId,
        subject: data.get("subject"),
        room: data.get("room") || undefined,
        teacher: data.get("teacher") || undefined,
        day,
        startTime: data.get("startTime"),
        endTime: data.get("endTime"),
        type,
      });
      if (!result.ok) {
        toast.error(result.message ?? "Could not add the slot.");
        return;
      }
      toast.success("Slot added to the timetable.");
      form.reset();
      setCourseId("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Plus className="size-4 text-secondary" aria-hidden="true" /> Add a slot
      </div>
      <EmptyCourses courses={courses} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="slot-course" label="Course" required>
          <CourseSelect courses={courses} value={courseId} onChange={setCourseId} id="slot-course" />
        </FormField>
        <FormField id="slot-subject" label="Subject" required>
          <Input id="slot-subject" name="subject" maxLength={120} required />
        </FormField>
        <FormField id="slot-day" label="Day" required>
          <select id="slot-day" className={selectClass} value={day} onChange={(event) => setDay(event.target.value)}>
            {DAY_ORDER.map((value) => (
              <option key={value} value={value}>{DAY_LABELS[value]}</option>
            ))}
          </select>
        </FormField>
        <FormField id="slot-type" label="Type" required>
          <select id="slot-type" className={selectClass} value={type} onChange={(event) => setType(event.target.value)}>
            {Object.entries(SLOT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FormField>
        <FormField id="slot-start" label="Start" required>
          <Input id="slot-start" name="startTime" type="time" required />
        </FormField>
        <FormField id="slot-end" label="End" required>
          <Input id="slot-end" name="endTime" type="time" required />
        </FormField>
        <FormField id="slot-room" label="Room">
          <Input id="slot-room" name="room" maxLength={80} />
        </FormField>
        <FormField id="slot-teacher" label="Teacher">
          <Input id="slot-teacher" name="teacher" maxLength={120} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || courses.length === 0}>
          {pending ? "Adding…" : "Add slot"}
        </Button>
      </div>
    </form>
  );
}

export function AssignmentForm({ courses }: { courses: CourseOption[] }) {
  const [pending, startTransition] = useTransition();
  const [courseId, setCourseId] = React.useState("");
  const [category, setCategory] = React.useState("assignment");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createAssignmentAction({
        courseId,
        title: data.get("title"),
        description: data.get("description") || undefined,
        dueDate: data.get("dueDate") || undefined,
        category,
      });
      if (!result.ok) {
        toast.error(result.message ?? "Could not create the assignment.");
        return;
      }
      toast.success("Published to the class.");
      form.reset();
      setCourseId("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <EmptyCourses courses={courses} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="task-course" label="Course" required>
          <CourseSelect courses={courses} value={courseId} onChange={setCourseId} id="task-course" />
        </FormField>
        <FormField id="task-title" label="Title" required>
          <Input id="task-title" name="title" maxLength={200} required />
        </FormField>
        <FormField id="task-category" label="Category" required>
          <select id="task-category" className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}>
            {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FormField>
        <FormField id="task-due" label="Deadline">
          <Input id="task-due" name="dueDate" type="datetime-local" />
        </FormField>
      </div>
      <FormField id="task-description" label="Description">
        <Textarea id="task-description" name="description" rows={4} maxLength={4000} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || courses.length === 0}>
          {pending ? "Publishing…" : "Publish"}
        </Button>
      </div>
    </form>
  );
}

export function ModerationButtons({
  messageId,
  status,
  isIndexed,
}: {
  messageId: string;
  status: string;
  isIndexed: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <ConfirmActionButton
        action={setMessageModerationAction}
        input={{ messageId, moderationStatus: "visible", isIndexed: false }}
        label="Show"
        variant="ghost"
        disabled={status === "visible" && !isIndexed}
      />
      <ConfirmActionButton
        action={setMessageModerationAction}
        input={{ messageId, moderationStatus: "hidden", isIndexed: false }}
        label="Hide"
        variant="ghost"
        disabled={status === "hidden"}
      />
      <ConfirmActionButton
        action={setMessageModerationAction}
        input={{ messageId, moderationStatus: "indexed", isIndexed: true }}
        label="Index"
        variant="ghost"
        disabled={status === "indexed" && isIndexed}
      />
    </div>
  );
}
