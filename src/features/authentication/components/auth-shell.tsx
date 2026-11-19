import Link from "next/link";
import { GraduationCap, Quote } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/** Shared split-screen shell for all authentication screens. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden border-r border-border/60 bg-surface/40 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="ambient-glow pointer-events-none absolute inset-x-0 -top-24 h-96" aria-hidden="true" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-white shadow-md">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight">{APP_NAME}</span>
        </Link>

        <div className="relative max-w-lg space-y-6">
          <h2 className="text-balance text-4xl font-extrabold leading-tight xl:text-5xl">
            {APP_TAGLINE.split(".")[0]}.
            <br />
            <span className="text-gradient">Grow smarter.</span>
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            One place for your class documents, timetable, deadlines, discussions and an AI study
            assistant that answers only from your academic materials.
          </p>
          <blockquote className="glass relative space-y-3 rounded-lg p-5">
            <Quote className="size-5 text-accent" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-foreground/90">
              HIVE keeps the whole class in sync — and every AI answer comes with a source you can
              open and verify.
            </p>
          </blockquote>
        </div>

        <p className="relative text-xs text-muted">
          Free and open by design. No subscriptions. No ads. No upgrade prompts.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
