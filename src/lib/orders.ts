import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { MAX_QTY_PER_ITEM, ORDER_NUMBER_PREFIX, SAREE_SIZE } from "@/config/store";
import { db } from "./db";
import {
  codAllowed,
  computeTotals,
  normalizePhone,
  type CartLineInput,
  type PaymentMethodInput,
  type checkoutSchema,
} from "./checkout";
import type { z } from "zod";

/** A problem the customer can fix (shown as-is in the checkout). */
export class CheckoutError extends Error {}

type Client = typeof db | Prisma.TransactionClient;

export type PricedLine = {
  variantId: string;
  productSlug: string;
  name: string;
  size: string;
  image: string;
  /** current database price, in paise */
  unitPrice: number;
  quantity: number;
  stock: number;
  /** set when this line can't be bought as-is */
  problem?: string;
};

const label = (name: string, size: string) => (size === SAREE_SIZE ? name : `${name} (Size ${size})`);

/**
 * Price a cart from database prices only; client prices are never trusted.
 * Lines that can't be bought get a `problem` and are left out of the subtotal.
 */
export async function priceCart(lines: CartLineInput[], client: Client = db) {
  // The same variant twice (e.g. two tabs) becomes one line.
  const qty = new Map<string, number>();
  for (const l of lines) qty.set(l.variantId, Math.min(MAX_QTY_PER_ITEM, (qty.get(l.variantId) ?? 0) + l.quantity));

  const variants = await client.variant.findMany({
    where: { id: { in: [...qty.keys()] } },
    select: {
      id: true,
      size: true,
      stock: true,
      product: { select: { name: true, slug: true, images: true, price: true, isActive: true } },
    },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const priced: PricedLine[] = [];
  for (const [variantId, quantity] of qty) {
    const v = byId.get(variantId);
    if (!v) {
      priced.push({
        variantId,
        productSlug: "",
        name: "An item in your cart",
        size: "",
        image: "",
        unitPrice: 0,
        quantity,
        stock: 0,
        problem: "This item is no longer available. Please remove it.",
      });
      continue;
    }
    const line: PricedLine = {
      variantId,
      productSlug: v.product.slug,
      name: v.product.name,
      size: v.size,
      image: v.product.images[0] ?? "",
      unitPrice: v.product.price,
      quantity,
      stock: v.stock,
    };
    const what = label(line.name, line.size);
    if (!v.product.isActive) line.problem = `${what} is no longer available. Please remove it.`;
    else if (v.stock <= 0) line.problem = `${what} is sold out. Please remove it.`;
    else if (quantity > v.stock)
      line.problem = `Only ${v.stock} left of ${what}. Please reduce the quantity to ${v.stock}.`;
    priced.push(line);
  }

  const subtotal = priced.filter((l) => !l.problem).reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  return { lines: priced, subtotal };
}

export type CartQuote = Awaited<ReturnType<typeof priceCart>> & {
  codAvailable: boolean;
  totals: Record<PaymentMethodInput, ReturnType<typeof computeTotals>>;
};

export async function quoteCart(lines: CartLineInput[]): Promise<CartQuote> {
  const { lines: priced, subtotal } = await priceCart(lines);
  return {
    lines: priced,
    subtotal,
    codAvailable: codAllowed(subtotal),
    totals: { COD: computeTotals(subtotal, "COD"), PREPAID: computeTotals(subtotal, "PREPAID") },
  };
}

type CheckoutData = z.output<typeof checkoutSchema>;

/**
 * Create a COD order. Runs in one transaction: stock is decremented with a
 * conditional update (stock >= qty), so two buyers can never both get the last piece.
 */
export async function placeCodOrder(input: CheckoutData): Promise<{ orderNumber: string }> {
  if (input.paymentMethod !== "COD") {
    // Online payment arrives in Phase 4.
    throw new CheckoutError("Online payment isn't available yet. Please choose Cash on Delivery.");
  }

  return db.$transaction(
    async (tx) => {
      const { lines, subtotal } = await priceCart(input.items, tx);
      const problem = lines.find((l) => l.problem);
      if (problem) throw new CheckoutError(problem.problem);
      if (!codAllowed(subtotal)) {
        throw new CheckoutError("Cash on Delivery isn't available for orders of this value.");
      }

      for (const l of lines) {
        const { count } = await tx.variant.updateMany({
          where: { id: l.variantId, stock: { gte: l.quantity } },
          data: { stock: { decrement: l.quantity } },
        });
        if (count === 0) {
          throw new CheckoutError(`Sorry, ${label(l.name, l.size)} just sold out. Please update your cart.`);
        }
      }

      const [{ n }] = await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('order_number_seq') AS n`;
      const orderNumber = `${ORDER_NUMBER_PREFIX}${n}`;
      const totals = computeTotals(subtotal, "COD");

      await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          phone: input.phone,
          email: input.email,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          ...totals,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          status: "PLACED",
          items: {
            create: lines.map((l) => ({
              variantId: l.variantId,
              productName: l.name,
              size: l.size,
              image: l.image,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
            })),
          },
        },
      });

      return { orderNumber };
    },
    // Neon can take a few seconds to wake up from idle before the transaction starts.
    { maxWait: 10_000, timeout: 15_000 },
  );
}

/**
 * An order is only shown to someone who knows both its number and the phone
 * it was placed with, so order numbers can't be guessed to see other people's details.
 */
export async function findOrderForCustomer(orderNumber: string, phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const order = await db.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include: { items: true },
  });
  if (!order || order.phone !== normalized) return null;
  return order;
}

export type CustomerOrder = NonNullable<Awaited<ReturnType<typeof findOrderForCustomer>>>;
