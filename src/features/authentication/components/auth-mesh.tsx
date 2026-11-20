import { cn } from "@/lib/utils";

/**
 * Layered fluid mesh background: soft blurred violet/lavender glows behind crisp
 * organic bezier waves. Purely decorative — sits behind the auth content.
 */
export function AuthMesh({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {/* Blurred ambient glows */}
      <div
        className="absolute -left-24 -top-28 size-[26rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(112,40,245,0.38), transparent 70%)" }}
      />
      <div
        className="absolute -right-24 top-1/3 size-[22rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.30), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-28 left-1/4 size-[26rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(112,40,245,0.22), transparent 70%)" }}
      />

      {/* Crisp organic waves */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-40 220 C 180 120 320 320 520 240 C 680 176 760 300 860 250 L 860 -40 L -40 -40 Z"
          fill="#7028F5"
          fillOpacity="0.16"
        />
        <path
          d="M-40 820 C 200 720 300 900 520 820 C 700 754 780 880 860 840 L 860 1040 L -40 1040 Z"
          fill="#A855F7"
          fillOpacity="0.13"
        />
        <path
          d="M-40 300 C 200 210 340 400 560 320 C 720 262 800 380 860 340"
          stroke="#A855F7"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-40 700 C 220 620 320 780 540 700 C 720 636 800 740 860 710"
          stroke="#7028F5"
          strokeOpacity="0.26"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}
