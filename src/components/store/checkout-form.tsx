"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDownIcon, Loader2Icon, LockIcon } from "lucide-react";
import type { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COD_FEE, COD_MAX_ORDER_VALUE, SAREE_SIZE } from "@/config/store";
import { INDIAN_STATES } from "@/config/india";
import { checkoutSchema, customerSchema, type PaymentMethodInput } from "@/lib/checkout";
import { formatINR } from "@/lib/money";
import type { CartQuote } from "@/lib/orders";
import { useCart } from "@/stores/cart";
import { BottomBar } from "./bottom-bar";
import { useCartQuote } from "./cart-quote";
import { CartSkeleton, EmptyCart, hasProblems } from "./cart-view";

const formSchema = customerSchema.extend({ paymentMethod: checkoutSchema.shape.paymentMethod });
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

function Field({
  id,
  label,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-6 first:pt-0 last:border-0">
      <h2 className="mb-4 text-2xl">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function SummaryLines({ quote, method }: { quote: CartQuote; method: PaymentMethodInput }) {
  const t = quote.totals[method];
  return (
    <>
      <ul className="divide-y divide-border">
        {quote.lines.map((l) => (
          <li key={l.variantId} className="flex gap-3 py-3">
            <div className="relative aspect-4/5 w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
              {l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />}
              <span className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-foreground/80 text-[0.7rem] font-semibold text-white">
                {l.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="line-clamp-2 leading-snug">{l.name}</p>
              {l.size && l.size !== SAREE_SIZE && <p className="text-muted-foreground">Size {l.size}</p>}
              {l.problem && <p className="mt-0.5 text-destructive">{l.problem}</p>}
            </div>
            <p className="text-sm font-medium">{formatINR(l.unitPrice * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatINR(t.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>{t.shippingFee === 0 ? "Free" : formatINR(t.shippingFee)}</dd>
        </div>
        {t.codFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Cash on Delivery fee</dt>
            <dd>{formatINR(t.codFee)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatINR(t.total)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
    </>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const { quote, stale, failed, hydrated, empty, refresh } = useCartQuote();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  // A ref, not state: it blocks a second tap even before React re-renders.
  const submitting = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
      city: "",
      state: "" as FormInput["state"],
      paymentMethod: "COD",
    },
  });

  const selectedMethod = useWatch({ control, name: "paymentMethod" });
  const codAvailable = quote?.codAvailable ?? true;
  // Above the COD limit, COD is hidden, so it can't count as selected.
  const method: PaymentMethodInput = codAvailable ? selectedMethod : "PREPAID";

  if (placed) {
    return (
      <div className="flex flex-col items-center py-24 text-center" role="status">
        <Loader2Icon className="size-8 animate-spin text-accent" aria-hidden />
        <p className="mt-4 font-heading text-2xl">Order placed! Opening your confirmation…</p>
      </div>
    );
  }
  if (!hydrated) return <CartSkeleton />;
  if (empty) return <EmptyCart />;

  const blocked = hasProblems(quote);
  const total = quote?.totals[method].total;
  const canSubmit = !!quote && !stale && !blocked && !placing && method === "COD";

  async function onSubmit(data: FormOutput) {
    if (submitting.current || !canSubmit) return;
    submitting.current = true;
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          // Only ids and quantities are sent; the server prices everything itself.
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { orderNumber?: string; error?: string; field?: string };
      if (!res.ok || !json.orderNumber) {
        if (json.field && json.field in formSchema.shape) {
          setError(json.field as FieldPath<FormInput>, { message: json.error });
        }
        toast.error(json.error ?? "Couldn't place your order. Please try again.");
        refresh(); // stock may have changed
        return;
      }
      setPlaced(true);
      router.replace(`/order/${json.orderNumber}?phone=${data.phone}`);
      clearCart();
    } catch {
      toast.error("Network problem. Check your connection and try again.");
    } finally {
      submitting.current = false;
      setPlacing(false);
    }
  }

  const placeLabel = placing ? (
    <>
      <Loader2Icon className="animate-spin" aria-hidden />
      Placing order…
    </>
  ) : (
    <>
      <LockIcon aria-hidden />
      Place Order{total !== undefined && ` · ${formatINR(total)}`}
    </>
  );

  const invalid = (name: keyof FormInput) =>
    errors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};

  return (
    <form
      onSubmit={(e) => handleSubmit(onSubmit)(e)}
      noValidate
      className="md:grid md:grid-cols-[minmax(0,1fr)_24rem] md:items-start md:gap-12 lg:gap-16"
    >
      {/* Phone: collapsible summary at the top */}
      <div className="-mx-4 mb-6 border-y border-border bg-surface md:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          aria-controls="mobile-summary"
          className="flex min-h-14 w-full items-center justify-between px-4 text-sm font-medium"
        >
          <span className="flex items-center gap-1.5 text-accent">
            {summaryOpen ? "Hide" : "Show"} order summary
            <ChevronDownIcon className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
          </span>
          <span className="text-base font-semibold">{total !== undefined ? formatINR(total) : "…"}</span>
        </button>
        {summaryOpen && (
          <div id="mobile-summary" className="px-4 pb-4">
            {quote ? <SummaryLines quote={quote} method={method} /> : <CartSkeleton />}
          </div>
        )}
      </div>

      <div>
        <Section title="Contact">
          <Field id="customerName" label="Full name" error={errors.customerName?.message}>
            <Input id="customerName" autoComplete="name" autoCapitalize="words" {...invalid("customerName")} {...register("customerName")} />
          </Field>
          <Field id="phone" label="Mobile number" error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              {...invalid("phone")}
              {...register("phone")}
            />
          </Field>
          <Field id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="For your order confirmation"
              {...invalid("email")}
              {...register("email")}
            />
          </Field>
        </Section>

        <Section title="Delivery address">
          <Field id="addressLine1" label="Address" error={errors.addressLine1?.message}>
            <Input
              id="addressLine1"
              autoComplete="address-line1"
              placeholder="House no., building, street"
              {...invalid("addressLine1")}
              {...register("addressLine1")}
            />
          </Field>
          <Field id="addressLine2" label="Landmark / area" optional error={errors.addressLine2?.message}>
            <Input id="addressLine2" autoComplete="address-line2" {...register("addressLine2")} />
          </Field>
          <Field id="pincode" label="Pincode" error={errors.pincode?.message}>
            <Input
              id="pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="6 digits"
              {...invalid("pincode")}
              {...register("pincode")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="city" label="City" error={errors.city?.message}>
              <Input id="city" autoComplete="address-level2" autoCapitalize="words" {...invalid("city")} {...register("city")} />
            </Field>
            <Field id="state" label="State" error={errors.state?.message}>
              <select
                id="state"
                autoComplete="address-level1"
                {...invalid("state")}
                {...register("state")}
                className="h-12 w-full min-w-0 rounded-md border border-input bg-surface px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              >
                <option value="" disabled>
                  Select
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Payment">
          <fieldset className="grid gap-3">
            <legend className="sr-only">Payment method</legend>
            <label
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 opacity-60",
              )}
            >
              <input type="radio" value="PREPAID" disabled {...register("paymentMethod")} className="size-5 accent-accent" />
              <span className="flex-1">
                <span className="block font-medium">Pay Online (UPI / Card)</span>
                <span className="block text-sm text-muted-foreground">Coming soon</span>
              </span>
            </label>
            {codAvailable ? (
              <label
                className={cn(
                  "flex min-h-16 cursor-pointer items-center gap-3 rounded-md border bg-surface px-4 py-3 transition-colors",
                  method === "COD" ? "border-accent ring-1 ring-accent" : "border-border",
                )}
              >
                <input type="radio" value="COD" {...register("paymentMethod")} className="size-5 accent-accent" />
                <span className="flex-1">
                  <span className="block font-medium">Cash on Delivery</span>
                  <span className="block text-sm text-muted-foreground">Pay when your order arrives</span>
                </span>
                <span className="text-sm font-medium">+{formatINR(COD_FEE)}</span>
              </label>
            ) : (
              <p className="rounded-md bg-muted p-4 text-sm">
                Cash on Delivery isn&apos;t available for orders above {formatINR(COD_MAX_ORDER_VALUE)}. Online payment is
                coming soon. Meanwhile, please{" "}
                <Link href="/contact" className="font-medium text-accent underline">
                  contact us
                </Link>{" "}
                to place this order.
              </p>
            )}
          </fieldset>
        </Section>

        {failed && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            Couldn&apos;t load your cart prices.{" "}
            <button type="button" onClick={refresh} className="font-medium underline">
              Try again
            </button>
          </p>
        )}
        {blocked && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            Some items in your cart need attention.{" "}
            <Link href="/cart" className="font-medium underline">
              Review cart
            </Link>
          </p>
        )}

        <Button type="submit" size="lg" className="hidden w-full md:flex" disabled={!canSubmit}>
          {placeLabel}
        </Button>
      </div>

      {/* Desktop summary */}
      <aside className="hidden rounded-md border border-border bg-surface p-5 md:sticky md:top-24 md:block">
        <h2 className="text-2xl">Order summary</h2>
        <div className="mt-2">{quote ? <SummaryLines quote={quote} method={method} /> : <CartSkeleton />}</div>
      </aside>

      <BottomBar>
        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {placeLabel}
        </Button>
      </BottomBar>
    </form>
  );
}
