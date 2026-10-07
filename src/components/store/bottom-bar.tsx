"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/** Fixed thumb-reach action bar for phones; hidden from `md` up. */
export function BottomBar({ children, className }: { children: React.ReactNode; className?: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-bottom-bar");
    return () => root.classList.remove("has-bottom-bar");
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 h-bottom-bar border-t border-border bg-surface/95 px-4 pt-3 pb-safe backdrop-blur-md md:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

const DESKTOP_QUERY = "(min-width: 48rem)";

function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Bottom sheets on phones, side sheets on desktop. */
export function useSheetSide(): "bottom" | "right" {
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  return desktop ? "right" : "bottom";
}
