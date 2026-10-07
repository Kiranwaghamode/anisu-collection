// Checkout validation and fee rules. Shared by the checkout form (client)
// and /api/checkout (server), so keep it free of server-only imports.
import { z } from "zod";
import { COD_FEE, COD_MAX_ORDER_VALUE, FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_ITEM, SHIPPING_FEE } from "@/config/store";
import { INDIAN_STATES } from "@/config/india";

export const PHONE_RE = /^[6-9]\d{9}$/;
export const PINCODE_RE = /^\d{6}$/;

/** Accept what people paste: "+91 98765 43210", "098765-43210" → "9876543210". */
export function normalizePhone(v: string): string {
  return v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
}

const text = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `Please enter your ${label}`)
    .max(max, `${label[0].toUpperCase()}${label.slice(1)} is too long`);

export const customerSchema = z.object({
  customerName: text("full name", 80).min(2, "Please enter your full name"),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => PHONE_RE.test(v), "Enter a valid 10-digit mobile number"),
  email: z.string().trim().toLowerCase().max(120).pipe(z.email("Enter a valid email address")),
  addressLine1: text("address", 160).min(5, "Please enter your full address"),
  addressLine2: z.string().trim().max(160).optional().or(z.literal("")),
  pincode: z
    .string()
    .trim()
    .refine((v) => PINCODE_RE.test(v), "Enter a valid 6-digit pincode"),
  city: text("city", 60),
  state: z.enum(INDIAN_STATES, { error: "Please choose your state" }),
});

export type CustomerInput = z.input<typeof customerSchema>;

export const paymentMethodSchema = z.enum(["COD", "PREPAID"]);
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

export const cartLinesSchema = z
  .array(
    z.object({
      variantId: z.string().min(1).max(40),
      quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
    }),
  )
  .min(1, "Your cart is empty")
  .max(30);

export type CartLineInput = z.infer<typeof cartLinesSchema>[number];

export const checkoutSchema = customerSchema.extend({
  paymentMethod: paymentMethodSchema,
  items: cartLinesSchema,
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

/** BUILD_PLAN Phase 3 price rules. All values in paise. */
export function computeTotals(subtotal: number, paymentMethod: PaymentMethodInput) {
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const codFee = paymentMethod === "COD" ? COD_FEE : 0;
  return { subtotal, shippingFee, codFee, total: subtotal + shippingFee + codFee };
}

/** COD is hidden when the order would be worth more than the COD limit. */
export function codAllowed(subtotal: number): boolean {
  return computeTotals(subtotal, "COD").total <= COD_MAX_ORDER_VALUE;
}
