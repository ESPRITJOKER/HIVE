import { cn } from "@/lib/utils";

/**
 * Rich academic hero illustration: a glowing mortarboard floating above a
 * student at a laptop (bearing the HIVE hexagon), ringed by floating glass
 * cards — calendar, document and sparkle nodes — on a neon rim-lit platform.
 * Stylised inline SVG, theme-independent.
 */
export function BrandIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 360"
      className={cn("w-full max-w-[460px]", className)}
      role="img"
      aria-label="A student learning with HIVE"
    >
      <defs>
        <linearGradient id="bi-plat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7028F5" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7028F5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bi-cap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A855F7" />
          <stop offset="1" stopColor="#7028F5" />
        </linearGradient>
        <linearGradient id="bi-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id="bi-glow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#A855F7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#A855F7" stopOpacity="0" />
        </radialGradient>
        <filter id="bi-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ambient glow + platform */}
      <ellipse cx="210" cy="150" rx="150" ry="120" fill="url(#bi-glow)" />
      <ellipse cx="210" cy="300" rx="150" ry="34" fill="url(#bi-plat)" />
      <ellipse cx="210" cy="300" rx="150" ry="34" fill="none" stroke="#A855F7" strokeOpacity="0.6" strokeWidth="1.5" />

      {/* floating glass cards */}
      <g opacity="0.95">
        {/* calendar card */}
        <g transform="rotate(-8 92 150)">
          <rect x="60" y="120" width="64" height="60" rx="12" fill="url(#bi-card)" stroke="#A855F7" strokeOpacity="0.5" />
          <rect x="60" y="120" width="64" height="16" rx="12" fill="#A855F7" fillOpacity="0.4" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={70 + c * 16} y={144 + r * 11} width="9" height="7" rx="2" fill="#fff" fillOpacity="0.55" />
            )),
          )}
        </g>
        {/* document card */}
        <g transform="rotate(9 330 140)">
          <rect x="300" y="108" width="58" height="68" rx="12" fill="url(#bi-card)" stroke="#A855F7" strokeOpacity="0.5" />
          <rect x="312" y="124" width="34" height="5" rx="2.5" fill="#fff" fillOpacity="0.7" />
          <rect x="312" y="136" width="28" height="4" rx="2" fill="#fff" fillOpacity="0.45" />
          <rect x="312" y="146" width="32" height="4" rx="2" fill="#fff" fillOpacity="0.45" />
          <rect x="312" y="156" width="22" height="4" rx="2" fill="#fff" fillOpacity="0.45" />
        </g>
        {/* sparkle nodes */}
        <path d="M70 70 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill="#F5B942" fillOpacity="0.9" />
        <path d="M352 232 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#A855F7" />
      </g>

      {/* floating mortarboard cap */}
      <g transform="translate(210 54)">
        <ellipse cx="0" cy="40" rx="42" ry="10" fill="#7028F5" fillOpacity="0.35" filter="url(#bi-soft)" />
        <path d="M0 2 L46 20 L0 38 L-46 20 Z" fill="url(#bi-cap)" />
        <path d="M-30 25 L-30 40 C-30 48 -14 54 0 54 C14 54 30 48 30 40 L30 25 L0 37 Z" fill="#7028F5" />
        <path d="M46 20 L46 40" stroke="#F5B942" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="46" cy="43" r="3" fill="#F5B942" />
      </g>

      {/* student */}
      <g transform="translate(210 212)">
        {/* body / hoodie */}
        <path d="M-52 78 C-52 36 -26 18 0 18 C26 18 52 36 52 78 Z" fill="#7028F5" />
        <path d="M-52 78 C-52 48 -34 30 -20 26 L-20 78 Z" fill="#A855F7" fillOpacity="0.6" />
        {/* head */}
        <circle cx="0" cy="-2" r="20" fill="#C79BFB" />
        <path d="M-20 -6 C-20 -22 20 -22 20 -6 L20 -12 C20 -26 -20 -26 -20 -12 Z" fill="#2a1d55" />
        {/* glasses */}
        <circle cx="-8" cy="-1" r="6" fill="none" stroke="#2a1d55" strokeWidth="2" />
        <circle cx="9" cy="-1" r="6" fill="none" stroke="#2a1d55" strokeWidth="2" />
        <path d="M-2 -1 L3 -1" stroke="#2a1d55" strokeWidth="2" />
      </g>

      {/* laptop */}
      <g transform="translate(210 262)">
        <path d="M-70 18 L70 18 L82 44 L-82 44 Z" fill="#1e1c36" stroke="#A855F7" strokeOpacity="0.45" />
        <rect x="-58" y="-34" width="116" height="52" rx="6" fill="#17162b" stroke="#A855F7" strokeOpacity="0.55" />
        {/* HIVE hexagon on the lid */}
        <g transform="translate(0 -8) scale(0.9)">
          <path d="M0 -14 L12 -7 L12 7 L0 14 L-12 7 L-12 -7 Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 -14 L0 0 M0 0 L12 7 M0 0 L-12 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M0 -4 L6 -1 L6 5 L0 8 L-6 5 L-6 -1 Z" fill="#A855F7" />
        </g>
      </g>
    </svg>
  );
}

/** 3D-styled purple envelope with a success checkmark badge. */
export function EnvelopeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 130" className={cn("w-40", className)} role="img" aria-label="Email sent">
      <defs>
        <linearGradient id="env-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b45f7" />
          <stop offset="1" stopColor="#6420d6" />
        </linearGradient>
        <radialGradient id="env-glow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#A855F7" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A855F7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="70" rx="72" ry="52" fill="url(#env-glow)" />
      <rect x="26" y="40" width="108" height="72" rx="12" fill="url(#env-body)" stroke="#A855F7" strokeOpacity="0.6" />
      <path d="M26 50 L80 88 L134 50" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 108 L68 76" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M134 108 L92 76" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      {/* success badge */}
      <circle cx="122" cy="34" r="18" fill="#10B981" stroke="#080817" strokeWidth="3" />
      <path d="M114 34 l6 6 10 -12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
