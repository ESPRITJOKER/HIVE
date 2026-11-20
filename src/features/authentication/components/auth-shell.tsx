import Link from "next/link";
import { BookOpen, CalendarDays, Sparkles, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { AuthMesh } from "./auth-mesh";
import { BrandIllustration } from "./brand-illustration";

const FEATURES: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  { icon: BookOpen, title: "Course Resources", desc: "PDFs, notes and more" },
  { icon: CalendarDays, title: "Smart Timetable", desc: "Never miss a deadline" },
  { icon: Sparkles, title: "AI Study Assistant", desc: "Grounded answers from your materials" },
];

/** Shared split-screen shell for all authentication screens. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden border-r border-border/60 p-12 lg:flex lg:flex-col lg:justify-between">
        <AuthMesh />

        <Link href="/" className="relative w-max">
          <BrandLogo size="md" withWordmark animate={false} />
        </Link>

        <div className="relative my-8 space-y-7">
          <div className="max-w-lg space-y-4">
            <h2 className="text-balance font-heading text-4xl font-extrabold leading-[1.05] xl:text-5xl">
              Your class,
              <br />
              in one place.
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted">
              Documents, timetable, deadlines, discussions and an AI study assistant that answers
              only from your academic materials.
            </p>
          </div>

          <BrandIllustration className="mx-auto" />

          <div className="grid max-w-lg gap-2.5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass flex items-center gap-3 rounded-xl px-3.5 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted">
          Free and open by design. No subscriptions. No ads. No upgrade prompts.
        </p>
      </section>

      {/* Form panel */}
      <section className="relative flex items-center justify-center px-5 py-10 sm:px-10">
        <AuthMesh className="opacity-70 lg:hidden" />
        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-6 flex justify-center lg:hidden">
            <BrandLogo size="lg" tagline />
          </Link>
          <div className="auth-card rounded-2xl bg-surface/70 p-6 backdrop-blur-xl sm:p-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
