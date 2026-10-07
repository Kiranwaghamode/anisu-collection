"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked (e.g. insecure context); nothing useful to do.
        }
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {copied ? <CheckIcon className="size-4 text-emerald-700" /> : <CopyIcon className="size-4" />}
    </button>
  );
}
