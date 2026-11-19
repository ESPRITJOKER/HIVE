"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Accessible label + description + error wiring for form controls. */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
