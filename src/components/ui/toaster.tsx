"use client";

import { Toaster as SonnerToaster } from "sonner";

/** App-wide toast host. Mounted once in the root layout. */
export function Toaster() {
  return (
    <SonnerToaster
      theme="system"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "glass-strong rounded-lg text-foreground",
          title: "font-semibold",
          description: "text-muted",
          error: "border-danger/50",
          success: "border-success/50",
        },
      }}
    />
  );
}
