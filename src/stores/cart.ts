"use client";

import { useSyncExternalStore } from "react";
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
  /** Refresh names, images and prices from a server quote. */
  sync: (fresh: Pick<CartItem, "variantId" | "name" | "image" | "unitPrice">[]) => void;
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
      sync: (fresh) =>
        set((s) => {
          const byId = new Map(fresh.filter((f) => f.name && f.unitPrice > 0).map((f) => [f.variantId, f]));
          let changed = false;
          const items = s.items.map((i) => {
            const f = byId.get(i.variantId);
            if (!f || (f.name === i.name && f.image === i.image && f.unitPrice === i.unitPrice)) return i;
            changed = true;
            return { ...i, name: f.name, image: f.image, unitPrice: f.unitPrice };
          });
          return changed ? { items } : s;
        }),
    }),
    { name: "anisu-cart", version: 1, partialize: (s) => ({ items: s.items }) },
  ),
);

export const selectCartCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (s: CartState) => s.items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);

// `useCart.persist` only exists in the browser (no localStorage during prerender).
const subscribeHydration = (cb: () => void) => useCart.persist?.onFinishHydration(cb) ?? (() => {});

/** False until the saved cart has loaded from localStorage. */
export function useCartHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => useCart.persist?.hasHydrated() ?? false,
    () => false,
  );
}

/** Cart drawer open state (not persisted). */
export const useCartDrawer = create<{ open: boolean; setOpen: (open: boolean) => void }>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
