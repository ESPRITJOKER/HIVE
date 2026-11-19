"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HIVE] Unhandled UI error:", error.message);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <ErrorState
        title="We hit an unexpected error"
        description="Your academic data is safe. Try again, or sign out and back in if the problem persists."
        onRetry={reset}
        className="max-w-lg border-transparent bg-transparent"
      />
    </main>
  );
}
