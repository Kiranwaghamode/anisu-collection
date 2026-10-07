"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MAX_QTY_PER_ITEM } from "@/config/store";
import { formatINR } from "@/lib/money";
import { useCart, useCartDrawer } from "@/stores/cart";
import { BottomBar } from "./bottom-bar";
import { PriceLine } from "./product-card";

type Variant = { id: string; size: string; stock: number };

type Props = {
  product: {
    slug: string;
    name: string;
    price: number;
    mrp: number | null;
    image: string;
    type: "SAREE" | "KURTI";
  };
  variants: Variant[];
};

type Intent = "add" | "buy";

function SizeButtons({
  variants,
  selectedId,
  onSelect,
}: {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (v: Variant) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
      {variants.map((v) => {
        const soldOut = v.stock <= 0;
        const selected = v.id === selectedId;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={soldOut ? `${v.size}, sold out` : v.size}
            disabled={soldOut}
            onClick={() => onSelect(v)}
            className={cn(
              "relative flex h-12 min-w-14 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
              selected && "border-accent bg-accent text-accent-foreground",
              !selected && !soldOut && "border-border bg-surface hover:border-foreground/50",
              soldOut && "cursor-not-allowed border-border bg-muted text-muted-foreground/60 line-through",
            )}
          >
            {v.size}
          </button>
        );
      })}
    </div>
  );
}

export function ProductPurchase({ product, variants }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const openCart = useCartDrawer((s) => s.setOpen);

  const isKurti = product.type === "KURTI";
  const soldOut = variants.every((v) => v.stock <= 0);
  // Sarees have a single "Free Size" variant, so it's chosen for the customer.
  const [selectedId, setSelectedId] = useState<string | null>(
    isKurti ? null : (variants.find((v) => v.stock > 0)?.id ?? null),
  );
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sheetIntent, setSheetIntent] = useState<Intent | null>(null);

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, selected?.stock ?? MAX_QTY_PER_ITEM));

  function select(v: Variant) {
    setSelectedId(v.id);
    setSizeError(false);
    setQty((q) => Math.min(q, Math.min(MAX_QTY_PER_ITEM, v.stock)));
  }

  function commit(intent: Intent, variant: Variant) {
    add({
      variantId: variant.id,
      productSlug: product.slug,
      name: product.name,
      size: variant.size,
      image: product.image,
      unitPrice: product.price,
      quantity: Math.min(qty, variant.stock),
    });
    if (intent === "buy") router.push("/checkout");
    else openCart(true);
  }

  /** `fromBar`: on phones, a missing size opens the size sheet instead of an inline error. */
  function handle(intent: Intent, fromBar = false) {
    if (soldOut) return;
    if (!selected) {
      if (fromBar) setSheetIntent(intent);
      else setSizeError(true);
      return;
    }
    commit(intent, selected);
  }

  return (
    <>
      {isKurti && (
        <div className="mt-6">
          <div className="mb-2.5 flex items-baseline justify-between">
            <p id="size-label" className="text-sm font-semibold">
              Size{selected && <span className="font-normal text-muted-foreground">: {selected.size}</span>}
            </p>
          </div>
          <SizeButtons variants={variants} selectedId={selectedId} onSelect={select} />
          {sizeError && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              Please select a size.
            </p>
          )}
        </div>
      )}

      {!soldOut && (
        <div className="mt-6">
          <p className="mb-2.5 text-sm font-semibold">Quantity</p>
          <div className="inline-flex items-center rounded-md border border-border bg-surface">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="flex size-12 items-center justify-center disabled:opacity-40"
            >
              <MinusIcon className="size-4" />
            </button>
            <span className="w-10 text-center font-medium tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              aria-label="Increase quantity"
              className="flex size-12 items-center justify-center disabled:opacity-40"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          {selected && selected.stock <= 3 && (
            <p className="mt-2 text-sm font-medium text-accent">Only {selected.stock} left</p>
          )}
        </div>
      )}

      {/* Desktop buttons; phones use the sticky bar below */}
      <div className="mt-8 hidden gap-3 md:grid md:grid-cols-2">
        {soldOut ? (
          <Button disabled className="col-span-2">
            Sold out
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={() => handle("add")}>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" onClick={() => handle("buy")}>
              Buy Now
            </Button>
          </>
        )}
      </div>

      <BottomBar className="flex items-center gap-2.5">
        <div className="min-w-0 shrink-0 pr-1">
          <p className="text-[0.7rem] leading-none text-muted-foreground">Price</p>
          <p className="mt-1 text-base leading-none font-semibold">{formatINR(product.price)}</p>
        </div>
        {soldOut ? (
          <Button disabled className="flex-1">
            Sold out
          </Button>
        ) : (
          <>
            <Button className="flex-1 px-3" onClick={() => handle("add", true)}>
              Add to Cart
            </Button>
            <Button variant="outline" className="flex-1 px-3" onClick={() => handle("buy", true)}>
              Buy Now
            </Button>
          </>
        )}
      </BottomBar>

      {/* Size picker for phones, opened from the sticky bar when no size is chosen */}
      {isKurti && (
        <Sheet open={sheetIntent !== null} onOpenChange={(o) => !o && setSheetIntent(null)}>
          <SheetContent side="bottom" className="gap-0 rounded-t-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border" aria-hidden />
            <SheetHeader className="px-5 pt-3 pb-4">
              <SheetTitle className="text-2xl font-semibold">Select size</SheetTitle>
              <SheetDescription asChild>
                <div>
                  <PriceLine price={product.price} mrp={product.mrp} className="text-base text-foreground" />
                </div>
              </SheetDescription>
            </SheetHeader>
            <div className="px-5">
              <SizeButtons
                variants={variants}
                selectedId={selectedId}
                onSelect={(v) => {
                  select(v);
                  const intent = sheetIntent;
                  setSheetIntent(null);
                  if (intent) commit(intent, v);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
