import { cn } from "@/lib/utils";

/** Smooth SVG line chart with a soft gradient fill and an emphasised endpoint. */
export function LineChart({
  points,
  color = "#7028F5",
  height = 150,
  className,
}: {
  points: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const w = 440;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const id = `lc-${points.join("-").slice(0, 12)}`;
  const xs = (i: number) => (i / (points.length - 1)) * (w - 20) + 10;
  const ys = (v: number) => height - 18 - ((v - min) / (max - min || 1)) * (height - 36);
  const path = points.map((p, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${ys(p).toFixed(1)}`).join(" ");
  const area = `${path} L${xs(points.length - 1)} ${height} L${xs(0)} ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="10" x2={w - 10} y1={18 + g * (height - 36)} y2={18 + g * (height - 36)} stroke="currentColor" strokeOpacity="0.08" />
      ))}
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xs(i)} cy={ys(p)} r={i === points.length - 1 ? 4 : 2.5} fill={color} />
      ))}
    </svg>
  );
}

/** Area chart variant anchored to a zero baseline. */
export function AreaChart({ points, color = "#7028F5", height = 160, className }: { points: number[]; color?: string; height?: number; className?: string }) {
  const w = 460;
  const max = Math.max(...points);
  const id = `ac-${points.join("-").slice(0, 12)}`;
  const xs = (i: number) => (i / (points.length - 1)) * (w - 20) + 10;
  const ys = (v: number) => height - 18 - (v / (max || 1)) * (height - 36);
  const path = points.map((p, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${ys(p).toFixed(1)}`).join(" ");
  const area = `${path} L${xs(points.length - 1)} ${height} L${xs(0)} ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="10" x2={w - 10} y1={18 + g * (height - 36)} y2={18 + g * (height - 36)} stroke="currentColor" strokeOpacity="0.08" />
      ))}
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xs(i)} cy={ys(p)} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

/** Labelled horizontal bar for distribution breakdowns. */
export function BarRow({ label, value, max, sub }: { label: string; value: number; max: number; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-xs font-medium">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border/50">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-muted">{sub}</span>
    </div>
  );
}
