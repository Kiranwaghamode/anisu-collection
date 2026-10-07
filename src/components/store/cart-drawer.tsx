"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatINR } from "@/lib/money";
import { selectCartCount, useCart, useCartDrawer } from "@/stores/cart";
import { useCartQuote } from "./cart-quote";
import { CartLines, CartSkeleton, EmptyCart, FreeShippingNote, hasProblems, useDisplaySubtotal } from "./cart-view";

export function CartDrawer() {
  const open = useCartDrawer((s) => s.open);
  const setOpen = useCartDrawer((s) => s.setOpen);
  const count = useCart(selectCartCount);
  const { quote, hydrated, empty } = useCartQuote(open);
  const subtotal = useDisplaySubtotal(quote);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4">
          <SheetTitle className="text-2xl font-semibold">
            Your cart{hydrated && count > 0 && <span className="text-muted-foreground"> ({count})</span>}
          </SheetTitle>
          <SheetDescription className="sr-only">Items in your cart</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5">
          {!hydrated ? <CartSkeleton /> : empty ? <EmptyCart onNavigate={close} /> : <CartLines quote={quote} onNavigate={close} />}
        </div>

        {hydrated && !empty && (
          <div className="space-y-4 border-t border-border bg-surface px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <FreeShippingNote subtotal={subtotal} />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-semibold">{formatINR(subtotal)}</span>
            </div>
            {hasProblems(quote) ? (
              <Button className="w-full" disabled>
                Fix the items above to continue
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout" onClick={close}>
                  Checkout · {formatINR(subtotal)}
                </Link>
              </Button>
            )}
            <Link
              href="/cart"
              onClick={close}
              className="flex min-h-11 items-center justify-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              View full cart
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
