"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger offset in ms, applied as a transition delay. */
  delay?: number;
  /** Render a different element (e.g. "li", "section"). Defaults to "div". */
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * Reveals its children with a fade-and-rise once they scroll into view, using
 * the shared `.reveal` / `.is-visible` utilities. Content is visible by default
 * if IntersectionObserver is unavailable, so nothing is ever trapped hidden.
 */
export function Reveal({ delay = 0, as, className, style, children, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as React.ElementType;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
