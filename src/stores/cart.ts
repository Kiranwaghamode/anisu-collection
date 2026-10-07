"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QTY_PER_ITEM } from "@/config/store";

// Prices here are for display only — the server always recalculates from the DB.
export type CartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  size: string;
  image: string;
  unitPrice: number; // paise
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  updateQty: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const clampQty = (q: number) => Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.floor(q)));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          if (!existing) return { items: [...s.items, { ...item, quantity: clampQty(item.quantity) }] };
          return {
            items: s.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: clampQty(i.quantity + item.quantity) }
                : i,
            ),
          };
        }),
      updateQty: (variantId, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: clampQty(quantity) } : i)),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "anisu-cart", version: 1 },
  ),
);

export const selectCartCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
