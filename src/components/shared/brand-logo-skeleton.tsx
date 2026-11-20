import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

const TILE: Record<LogoSize, string> = {
  sm: "size-8 rounded-lg",
  md: "size-10 rounded-xl",
  lg: "size-14 rounded-2xl",
  xl: "size-20 rounded-[1.4rem]",
};

/**
 * Shimmer placeholder shown while the BrandLogo chunk is loading. Kept in its
 * own module (no heavy deps) so it can serve as an eager lazy-loading fallback.
 */
export function BrandLogoSkeleton({
  size = "md",
  withWordmark = false,
  tagline = false,
  className,
}: {
  size?: LogoSize;
  withWordmark?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  const showWord = withWordmark || tagline;

  return (
    <span className={cn("inline-flex items-center gap-3", className)} aria-hidden="true">
      <span className={cn("shimmer shrink-0 bg-border/50", TILE[size])} />
      {showWord ? (
        <span className="flex flex-col gap-2">
          <span className="shimmer h-4 w-24 rounded-md bg-border/50" />
          {tagline ? <span className="shimmer h-2.5 w-32 rounded-md bg-border/40" /> : null}
        </span>
      ) : null}
    </span>
  );
}
