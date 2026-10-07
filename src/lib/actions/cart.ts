"use server";

import { cartLinesSchema } from "@/lib/checkout";
import { quoteCart, type CartQuote } from "@/lib/orders";

/** Current prices, stock and totals for the cart, straight from the database. */
export async function getCartQuote(lines: unknown): Promise<CartQuote | null> {
  const parsed = cartLinesSchema.safeParse(lines);
  if (!parsed.success) return null;
  return quoteCart(parsed.data);
}
