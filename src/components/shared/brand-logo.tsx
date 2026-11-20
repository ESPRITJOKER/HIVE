"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export { BrandLogoSkeleton } from "./brand-logo-skeleton";

type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<
  LogoSize,
  { tile: string; icon: string; word: string; tagline: string; ring: string }
> = {
  sm: { tile: "size-8 rounded-lg", icon: "size-4", word: "text-base", tagline: "text-[10px]", ring: "rounded-lg" },
  md: { tile: "size-10 rounded-xl", icon: "size-5", word: "text-lg", tagline: "text-xs", ring: "rounded-xl" },
  lg: { tile: "size-14 rounded-2xl", icon: "size-7", word: "text-2xl", tagline: "text-sm", ring: "rounded-2xl" },
  xl: { tile: "size-20 rounded-[1.4rem]", icon: "size-10", word: "text-3xl", tagline: "text-sm", ring: "rounded-[1.4rem]" },
};

export interface BrandLogoProps {
  size?: LogoSize;
  /** Show the "HIVE" wordmark beside the mark. */
  withWordmark?: boolean;
  /** Show the tagline under the wordmark (implies withWordmark). */
  tagline?: boolean;
  /** Animate the entrance + sheen. Defaults to true. */
  animate?: boolean;
  /** Use the animated gradient for the wordmark. */
  gradientWordmark?: boolean;
  className?: string;
}

/**
 * The HIVE brand mark. A gradient tile with the graduation icon, an expanding
 * halo and a light sheen on entrance. Pair with {@link BrandLogoSkeleton} as a
 * lazy-loading fallback for a shimmer-to-logo reveal.
 */
export function BrandLogo({
  size = "md",
  withWordmark = false,
  tagline = false,
  animate = true,
  gradientWordmark = false,
  className,
}: BrandLogoProps) {
  const s = SIZES[size];
  const showWord = withWordmark || tagline;

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className={cn("relative grid shrink-0 place-items-center", s.tile)}>
        {/* Expanding halo */}
        {animate ? (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 border border-secondary/50",
              s.ring,
            )}
            style={{ animation: "hive-ring 1.1s ease-out 0.15s both" }}
          />
        ) : null}

        {/* Gradient tile + clipped sheen */}
        <span
          className={cn(
            "relative grid size-full place-items-center overflow-hidden text-white shadow-lg",
            s.tile,
            animate && "animate-logo-in",
          )}
          style={{
            background:
              "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
          }}
        >
          {animate ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/35 blur-[2px]"
              style={{ animation: "hive-sheen 1.4s ease-in-out 0.5s both" }}
            />
          ) : null}
          <GraduationCap className={cn("relative", s.icon)} aria-hidden="true" />
        </span>
      </span>

      {showWord ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading font-extrabold tracking-tight",
              s.word,
              gradientWordmark && "text-gradient-animated",
            )}
          >
            {APP_NAME}
          </span>
          {tagline ? (
            <span className={cn("mt-1.5 text-muted", s.tagline)}>{APP_TAGLINE}</span>
          ) : null}
        </span>
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </span>
  );
}
