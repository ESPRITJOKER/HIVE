import { ServerOff } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";

/** Honest configuration state — shown instead of fake data or disabled mystery buttons. */
export function ConfigNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="status"
      className="mb-5 flex gap-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm"
    >
      <ServerOff className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-warning">Backend not connected yet</p>
        <p className="text-xs leading-relaxed text-muted">
          Add <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="text-foreground">.env.local</code> to enable sign-in. See{" "}
          <code className="text-foreground">.env.example</code>.
        </p>
      </div>
    </div>
  );
}
