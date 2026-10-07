"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleProductActive } from "@/lib/actions/admin-products";

/** Show/hide a product in the shop with one tap. */
export function ActiveToggle({ id, active, name }: { id: string; active: boolean; name: string }) {
  const [optimistic, setOptimistic] = useOptimistic(active);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={`Show ${name} in shop`}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          const res = await toggleProductActive(id, !optimistic);
          if (!res.ok) toast.error("Couldn't update. Please try again.");
        })
      }
      className="flex min-h-11 items-center gap-2 text-sm"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          optimistic ? "bg-accent" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
            optimistic && "translate-x-5",
          )}
        />
      </span>
      <span className={optimistic ? "font-medium" : "text-muted-foreground"}>{optimistic ? "Live" : "Hidden"}</span>
    </button>
  );
}
