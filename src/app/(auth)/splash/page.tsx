"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { resolveLandingRoute } from "@/features/authentication/services/auth-service";

export default function SplashPage() {
  const router = useRouter();

  React.useEffect(() => {
    let active = true;
    resolveLandingRoute().then((route) => {
      if (active) router.replace(route);
    });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 text-center">
      <div className="grid size-20 place-items-center rounded-2xl bg-primary text-white shadow-lg">
        <GraduationCap className="size-10" aria-hidden="true" />
      </div>
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-muted">{APP_TAGLINE}</p>
      </div>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
