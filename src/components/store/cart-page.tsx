"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COD_FEE, SHIPPING_FEE } from "@/config/store";
import { formatINR } from "@/lib/money";
import { BottomBar } from "./bottom-bar";
import { useCartQuote } from "./cart-quote";
import { CartLines, CartSkeleton, EmptyCart, FreeShippingNote, hasProblems, useDisplaySubtotal } from "./cart-view";

export function CartPage() {
  const { quote, hydrated, empty } = useCartQuote();
  const subtotal = useDisplaySubtotal(quote);
  const shipping = quote?.totals.PREPAID.shippingFee ?? null;
  const blocked = hasProblems(quote);

  if (!hydrated) return <CartSkeleton />;
  if (empty) return <EmptyCart />;

  const checkout = blocked ? (
    <Button className="w-full" disabled>
      Fix the items above to continue
    </Button>
  ) : (
    <Button asChild size="lg" className="w-full">
      <Link href="/checkout">Checkout · {formatINR(subtotal)}</Link>
    </Button>
  );

  return (
    <div className="md:grid md:grid-cols-[1fr_22rem] md:items-start md:gap-12">
      <CartLines quote={quote} />

      <aside className="mt-4 rounded-md border border-border bg-surface p-5 md:sticky md:top-24 md:mt-0">
        <h2 className="text-2xl">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatINR(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-medium">
              {shipping === null ? "…" : shipping === 0 ? "Free" : formatINR(SHIPPING_FEE)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Cash on Delivery adds {formatINR(COD_FEE)}. Final total shown at checkout.
        </p>
        <div className="mt-4">
          <FreeShippingNote subtotal={subtotal} />
        </div>
        <div className="mt-5 hidden md:block">{checkout}</div>
      </aside>

      <BottomBar>{checkout}</BottomBar>
    </div>
  );
}
