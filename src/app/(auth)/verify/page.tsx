"use client";

import * as React from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyParams = { verified?: string; error?: string };

export default function VerifyPage(props: { searchParams: Promise<VerifyParams> }) {
  const params = React.use(props.searchParams);
  const message =
    params.verified === "true"
      ? "Your email has been verified. You can sign in now."
      : params.error
        ? "That verification link is invalid or has expired. Request a new one."
        : null;

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-secondary">
        <MailCheck className="size-8" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold">Verify your email</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {message ??
            "Open the verification link we sent to your inbox. If email confirmation is not enabled for this project, you can sign in directly."}
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </div>
  );
}
