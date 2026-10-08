"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Section entrance: fade + 8px slide-up, 0.4s, once (BUILD_PLAN Section 1).
 * Plain CSS transition (the `reveal` utility in globals.css), so no animation library is shipped.
 * With reduced motion, the global rule in globals.css makes it instant.
 * Don't wrap above-the-fold content: it starts hidden and would delay LCP.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-shown={shown || undefined} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
