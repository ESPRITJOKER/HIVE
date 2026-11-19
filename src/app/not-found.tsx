import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div className="space-y-5">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/15 text-secondary">
          <Compass className="size-7" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-secondary">404</p>
          <h1 className="mt-1 text-2xl font-bold">Page not found</h1>
          <p className="mt-2 text-sm text-muted">That page does not exist or has moved.</p>
        </div>
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
