import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      className={cn("size-5 animate-spin text-secondary", className)}
      role="status"
      aria-label="Loading"
    />
  );
}
