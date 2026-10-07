"use client";

import { useEffect, useState } from "react";
import { getCartQuote } from "@/lib/actions/cart";
import type { CartQuote } from "@/lib/orders";
import { useCart, useCartHydrated } from "@/stores/cart";

/**
 * Live server quote for the cart: database prices, stock problems and totals.
 * `stale` is true while the cart has changed and a fresh quote is on its way.
 */
export function useCartQuote(enabled = true) {
  const items = useCart((s) => s.items);
  const sync = useCart((s) => s.sync);
  const hydrated = useCartHydrated();
  const [nonce, setNonce] = useState(0);
  const lineKey = items.map((i) => `${i.variantId}:${i.quantity}`).join(",");
  const key = lineKey && `${nonce}|${lineKey}`;
  const [result, setResult] = useState<{ key: string; quote: CartQuote | null; failed: boolean } | null>(null);

  useEffect(() => {
    if (!enabled || !hydrated || !key) return;
    let cancelled = false;
    const lines = key.split("|")[1].split(",").map((part) => {
      const [variantId, quantity] = part.split(":");
      return { variantId, quantity: Number(quantity) };
    });
    // Small delay so tapping +/− several times sends one request.
    const timer = setTimeout(async () => {
      try {
        const quote = await getCartQuote(lines);
        if (cancelled) return;
        setResult({ key, quote, failed: !quote });
        if (quote) sync(quote.lines);
      } catch {
        if (!cancelled) setResult({ key, quote: null, failed: true });
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, hydrated, key, sync]);

  const fresh = result?.key === key;
  return {
    /** latest quote (may be for a slightly older cart while `stale`) */
    quote: result?.quote ?? null,
    stale: !!key && !fresh,
    failed: fresh && !!result?.failed,
    hydrated,
    empty: hydrated && items.length === 0,
    /** Fetch a new quote, e.g. after the server rejected an order for stock. */
    refresh: () => setNonce((n) => n + 1),
  };
}
