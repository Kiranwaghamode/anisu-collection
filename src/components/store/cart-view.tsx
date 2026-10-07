"use client";

import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_ITEM, SAREE_SIZE } from "@/config/store";
import { formatINR } from "@/lib/money";
import type { CartQuote } from "@/lib/orders";
import { selectCartSubtotal, useCart } from "@/stores/cart";

export function QtyStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (q: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "size-11" : "size-12";
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={`Decrease quantity of ${label}`}
        className={cn("flex items-center justify-center disabled:opacity-40", btn)}
      >
        <MinusIcon className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
        className={cn("flex items-center justify-center disabled:opacity-40", btn)}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}

/** Editable list of cart items, with stock problems from the server quote. */
export function CartLines({ quote, onNavigate }: { quote: CartQuote | null; onNavigate?: () => void }) {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const info = new Map(quote?.lines.map((l) => [l.variantId, l]));

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const line = info.get(item.variantId);
        const max = Math.max(1, Math.min(MAX_QTY_PER_ITEM, line?.stock ?? MAX_QTY_PER_ITEM));
        return (
          <li key={item.variantId} className="flex gap-3.5 py-4">
            <Link
              href={`/product/${item.productSlug}`}
              onClick={onNavigate}
              className="relative aspect-4/5 w-22 shrink-0 overflow-hidden rounded-md bg-muted"
            >
              {item.image && <Image src={item.image} alt="" fill sizes="88px" className="object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/product/${item.productSlug}`}
                  onClick={onNavigate}
                  className="line-clamp-2 text-sm leading-snug font-medium"
                >
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(item.variantId)}
                  aria-label={`Remove ${item.name}`}
                  className="-mt-2.5 -mr-2.5 flex size-11 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
              {item.size !== SAREE_SIZE && <p className="text-sm text-muted-foreground">Size {item.size}</p>}
              <p className="mt-0.5 text-sm font-semibold">{formatINR(item.unitPrice)}</p>
              {line?.problem && (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {line.problem}
                </p>
              )}
              <div className="mt-auto pt-2">
                <QtyStepper
                  size="sm"
                  value={item.quantity}
                  max={max}
                  label={item.name}
                  onChange={(q) => updateQty(item.variantId, q)}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** "Add ₹X more for free shipping" nudge. */
export function FreeShippingNote({ subtotal }: { subtotal: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  return (
    <div>
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            Add <span className="font-semibold">{formatINR(remaining)}</span> more for free shipping
          </>
        ) : (
          <span className="font-medium text-accent">You get free shipping!</span>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Subtotal from the server quote, falling back to the cart's own prices while it loads. */
export function useDisplaySubtotal(quote: CartQuote | null) {
  const local = useCart(selectCartSubtotal);
  return quote?.subtotal ?? local;
}

export function hasProblems(quote: CartQuote | null) {
  return !!quote?.lines.some((l) => l.problem);
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <ShoppingBagIcon className="size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
      <p className="mt-4 font-heading text-2xl">Your cart is empty</p>
      <p className="mt-1 text-sm text-muted-foreground">Find something you love.</p>
      <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3">
        <Button asChild>
          <Link href="/sarees" onClick={onNavigate}>
            Sarees
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kurtis" onClick={onNavigate}>
            Kurtis
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4 py-4" aria-busy="true" aria-label="Loading cart">
      {[0, 1].map((i) => (
        <div key={i} className="flex gap-3.5">
          <Skeleton className="aspect-4/5 w-22 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
