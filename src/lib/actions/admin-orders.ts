"use server";

import { refresh, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { notifyOrderShipped } from "@/lib/notify";
import {
  OrderActionError,
  changeOrderStatus,
  saveAdminNote,
  type OrderAction,
} from "@/lib/admin/orders";

export type ActionResult = { ok: true } | { ok: false; error: string };

const actionSchema = z.enum(["confirm", "cancel", "ship", "deliver", "rto"]);

const shipmentSchema = z.object({
  courierName: z.string().trim().min(2, "Enter the courier name").max(60),
  awbCode: z.string().trim().min(4, "Enter the tracking number").max(40),
  trackingUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => !v || /^https?:\/\//i.test(v), "Tracking link must start with http:// or https://")
    .optional(),
});

export type ShipmentForm = z.input<typeof shipmentSchema>;

export async function updateOrderStatus(
  orderId: string,
  action: OrderAction,
  shipment?: ShipmentForm,
): Promise<ActionResult> {
  await requireAdmin();
  const parsedAction = actionSchema.safeParse(action);
  if (!parsedAction.success || typeof orderId !== "string") return { ok: false, error: "Invalid request." };

  let ship;
  if (parsedAction.data === "ship") {
    const parsed = shipmentSchema.safeParse(shipment);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    ship = parsed.data;
  }

  try {
    const { restocked } = await changeOrderStatus(orderId, parsedAction.data, ship);
    // Stock went back up, so sold-out badges on the storefront may change.
    if (restocked) updateTag(CATALOG_TAG);
    if (parsedAction.data === "ship") after(() => notifyOrderShipped(orderId));
    refresh();
    return { ok: true };
  } catch (err) {
    if (err instanceof OrderActionError) return { ok: false, error: err.message };
    console.error("order status change failed", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateAdminNote(orderId: string, note: string): Promise<ActionResult> {
  await requireAdmin();
  if (typeof orderId !== "string" || typeof note !== "string" || note.length > 2000) {
    return { ok: false, error: "Note is too long." };
  }
  await saveAdminNote(orderId, note);
  refresh();
  return { ok: true };
}
