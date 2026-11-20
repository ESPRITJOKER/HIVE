import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles, Users } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { AuthMesh } from "@/features/authentication/components/auth-mesh";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <AuthMesh />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="w-max">
          <BrandLogo size="sm" withWordmark animate={false} />
        </Link>
        <nav className="flex items-center gap-2" aria-label="Main">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-5 pb-20 pt-12 text-center">
        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          Your class, your materials, your study assistant
        </div>

        <h1 className="max-w-4xl text-balance font-heading text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
          Learn Together.
          <br />
          <span className="text-secondary">Grow Smarter.</span>
        </h1>

        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          HIVE brings your documents, timetable, assignments, discussions and AI revision tools into
          one collaborative academic space — grounded in the materials your class actually uses.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">
              Join your class <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>

        <div className="grid w-full max-w-4xl gap-4 pt-10 sm:grid-cols-3">
          {[
            { icon: Users, title: "Collaborate", body: "Subject channels and shared academic resources." },
            { icon: GraduationCap, title: "Stay organised", body: "Timetable, deadlines and opportunities in one place." },
            { icon: Sparkles, title: "Study smarter", body: "Cited answers, revision sheets and quizzes from your notes." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass rounded-lg p-5 text-left">
              <Icon className="mb-3 size-5 text-secondary" aria-hidden="true" />
              <h2 className="mb-1 text-sm font-bold">{title}</h2>
              <p className="text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-border/60 px-5 py-6 text-center text-xs text-muted">
        {APP_NAME} · Free and open by design · No subscriptions, no ads, no upgrade prompts.
      </footer>
    </main>
  );
}
