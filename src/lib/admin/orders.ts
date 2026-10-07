import "server-only";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ORDER_TABS, STATUS_LABEL, type OrderTab } from "@/lib/order-status";

export const ADMIN_ORDERS_PAGE = 30;

export async function listOrders({ tab, q, page }: { tab: OrderTab; q?: string; page: number }) {
  const statuses = ORDER_TABS.find((t) => t.value === tab)?.statuses ?? null;
  const where: Prisma.OrderWhereInput = {};
  if (statuses) where.status = { in: [...statuses] };

  const term = q?.trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      ...(digits.length >= 3 ? [{ phone: { contains: digits.slice(-10) } }] : []),
    ];
  }

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: page * ADMIN_ORDERS_PAGE,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        customerName: true,
        phone: true,
        city: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const byStatus = new Map(counts.map((c) => [c.status, c._count._all]));
  return { orders, total, newCount: byStatus.get("PLACED") ?? 0 };
}

export type AdminOrderRow = Awaited<ReturnType<typeof listOrders>>["orders"][number];

export async function getAdminOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { select: { product: { select: { slug: true } } } } } } },
  });
}

export type AdminOrder = NonNullable<Awaited<ReturnType<typeof getAdminOrder>>>;

// ── Status changes ──────────────────────────────────────────────

/** Which statuses each action may start from. */
const FROM: Record<"confirm" | "cancel" | "ship" | "deliver" | "rto", OrderStatus[]> = {
  confirm: ["PLACED"],
  cancel: ["PLACED", "CONFIRMED"],
  ship: ["CONFIRMED"],
  deliver: ["SHIPPED"],
  rto: ["SHIPPED"],
};

export type OrderAction = keyof typeof FROM;

const TO: Record<OrderAction, OrderStatus> = {
  confirm: "CONFIRMED",
  cancel: "CANCELLED",
  ship: "SHIPPED",
  deliver: "DELIVERED",
  rto: "RTO",
};

/** Cancelled orders never left the shop, and RTO parcels come back: both go back into stock. */
const RESTOCK: OrderAction[] = ["cancel", "rto"];

export class OrderActionError extends Error {}

export type ShipmentInput = { courierName: string; awbCode: string; trackingUrl?: string };

/**
 * Move an order to its next status. The update only applies if the order is still
 * in an allowed status, so a double tap or two admins at once can't apply it twice
 * (and can't restock twice).
 */
export async function changeOrderStatus(id: string, action: OrderAction, shipment?: ShipmentInput) {
  return db.$transaction(
    async (tx) => {
      const data: Prisma.OrderUpdateManyMutationInput = { status: TO[action] };
      if (action === "ship") {
        if (!shipment) throw new OrderActionError("Enter the courier and tracking number.");
        data.courierName = shipment.courierName;
        data.awbCode = shipment.awbCode;
        data.trackingUrl = shipment.trackingUrl || null;
      }
      // COD is collected on delivery.
      if (action === "deliver") {
        const order = await tx.order.findUnique({ where: { id }, select: { paymentMethod: true } });
        if (order?.paymentMethod === "COD") data.paymentStatus = "PAID";
      }

      const { count } = await tx.order.updateMany({ where: { id, status: { in: FROM[action] } }, data });
      if (count === 0) {
        const current = await tx.order.findUnique({ where: { id }, select: { status: true } });
        throw new OrderActionError(
          current
            ? `This order is already ${STATUS_LABEL[current.status].toLowerCase()}. Refresh to see the latest.`
            : "Order not found.",
        );
      }

      if (RESTOCK.includes(action)) {
        const items = await tx.orderItem.findMany({ where: { orderId: id }, select: { variantId: true, quantity: true } });
        for (const i of items) {
          await tx.variant.update({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
        }
      }
      return { restocked: RESTOCK.includes(action) };
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function saveAdminNote(id: string, note: string) {
  await db.order.update({ where: { id }, data: { adminNote: note.trim() || null } });
}
