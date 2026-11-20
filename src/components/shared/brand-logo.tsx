"use client";

import * as React from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export { BrandLogoSkeleton } from "./brand-logo-skeleton";

type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<
  LogoSize,
  { tile: string; mark: string; word: string; tagline: string; ring: string }
> = {
  sm: { tile: "size-8 rounded-lg", mark: "size-5", word: "text-base", tagline: "text-[10px]", ring: "rounded-lg" },
  md: { tile: "size-10 rounded-xl", mark: "size-6", word: "text-lg", tagline: "text-xs", ring: "rounded-xl" },
  lg: { tile: "size-14 rounded-2xl", mark: "size-9", word: "text-2xl", tagline: "text-sm", ring: "rounded-2xl" },
  xl: { tile: "size-20 rounded-[1.4rem]", mark: "size-[3.25rem]", word: "text-3xl", tagline: "text-sm", ring: "rounded-[1.4rem]" },
};

/**
 * The HIVE mark: a hexagonal cube frame with a faceted gem core, crowned by a
 * graduation mortarboard and tassel. Rendered crisp-white for the gradient tile.
 */
export function HiveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      {/* hexagonal cube frame */}
      <path
        d="M24 16 L36.5 23 L36.5 35.5 L24 42.5 L11.5 35.5 L11.5 23 Z"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* isometric inner edges */}
      <path
        d="M24 16 L24 29 M24 29 L36.5 35.5 M24 29 L11.5 35.5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
      {/* faceted gem core */}
      <path d="M24 24.2 L29.4 27.3 L29.4 33.1 L24 36.2 L18.6 33.1 L18.6 27.3 Z" fill="#fff" fillOpacity="0.9" />
      <path d="M24 24.2 L29.4 27.3 L24 30.2 L18.6 27.3 Z" fill="#fff" />
      {/* mortarboard cap */}
      <path d="M24 4 L41 11 L24 18 L7 11 Z" fill="#fff" />
      <path
        d="M13 14.1 L13 19.5 C13 20.5 17.9 23 24 23 C30.1 23 35 20.5 35 19.5 L35 14.1 L24 18.6 Z"
        fill="#fff"
        fillOpacity="0.8"
      />
      {/* tassel */}
      <path d="M41 11 L41 19" stroke="#F5B942" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="41" cy="20.4" r="1.7" fill="#F5B942" />
    </svg>
  );
}

function Tagline({ className }: { className?: string }) {
  const parts = APP_TAGLINE.split(/(Grow Smarter\.?)/);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        /Grow Smarter/.test(part) ? (
          <span key={i} className="text-secondary">
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </span>
  );
}

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
 * The HIVE brand lockup. A gradient tile holding the {@link HiveMark}, with an
 * expanding halo and a light sheen on entrance. Pair with {@link BrandLogoSkeleton}
 * as a lazy-loading fallback for a shimmer-to-logo reveal.
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
            className={cn("pointer-events-none absolute inset-0 border border-secondary/50", s.ring)}
            style={{ animation: "hive-ring 1.1s ease-out 0.15s both" }}
          />
        ) : null}

        {/* Gradient tile + clipped sheen */}
        <span
          className={cn(
            "relative grid size-full place-items-center overflow-hidden shadow-lg",
            s.tile,
            animate && "animate-logo-in",
          )}
          style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}
        >
          {animate ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/35 blur-[2px]"
              style={{ animation: "hive-sheen 1.4s ease-in-out 0.5s both" }}
            />
          ) : null}
          <HiveMark className={cn("relative", s.mark)} />
        </span>
      </span>

      {showWord ? (
        <span className="flex flex-col leading-none">
          <span className={cn("font-heading font-extrabold tracking-tight", s.word, gradientWordmark && "text-gradient-animated")}>
            {APP_NAME}
          </span>
          {tagline ? <Tagline className={cn("mt-1.5 font-semibold text-muted", s.tagline)} /> : null}
        </span>
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </span>
  );
}
