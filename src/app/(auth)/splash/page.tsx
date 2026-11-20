"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { resolveLandingRoute } from "@/features/authentication/services/auth-service";
import { BrandLogoSkeleton } from "@/components/shared/brand-logo-skeleton";

// Lazy-load the animated brand mark: the lightweight shimmer skeleton paints
// immediately, then the logo chunk swaps in with its reveal animation.
const BrandLogo = dynamic(
  () => import("@/components/shared/brand-logo").then((m) => m.BrandLogo),
  {
    ssr: false,
    loading: () => <BrandLogoSkeleton size="xl" tagline />,
  },
);

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
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-7 overflow-hidden text-center">
      <div className="animate-float">
        <BrandLogo size="xl" tagline gradientWordmark className="flex-col gap-4" />
      </div>

      <div className="h-1 w-24 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
