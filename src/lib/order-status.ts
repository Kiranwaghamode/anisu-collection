// Order status labels and admin tabs. Client-safe (no server imports).
import type { OrderStatus } from "@/generated/prisma/enums";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RTO: "Returned (RTO)",
};

/** Badge colours: new orders stand out, finished ones fade. */
export const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-muted text-muted-foreground",
  PLACED: "bg-accent text-accent-foreground",
  CONFIRMED: "bg-amber-100 text-amber-900",
  SHIPPED: "bg-sky-100 text-sky-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-muted text-muted-foreground",
  RTO: "bg-red-100 text-red-900",
};

export const ORDER_TABS = [
  { value: "placed", label: "Placed", statuses: ["PLACED"] },
  { value: "confirmed", label: "Confirmed", statuses: ["CONFIRMED"] },
  { value: "shipped", label: "Shipped", statuses: ["SHIPPED"] },
  { value: "delivered", label: "Delivered", statuses: ["DELIVERED"] },
  { value: "closed", label: "Cancelled/RTO", statuses: ["CANCELLED", "RTO"] },
  { value: "all", label: "All", statuses: null },
] as const satisfies readonly { value: string; label: string; statuses: readonly OrderStatus[] | null }[];

export type OrderTab = (typeof ORDER_TABS)[number]["value"];
