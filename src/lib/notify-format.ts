// Data for order emails. Pure functions (no server-only imports), so the
// preview script can render them outside Next.js.
import type { Order, OrderItem } from "@/generated/prisma/client";
import type { OrderEmailData } from "@/emails/OrderPlaced";
import { absoluteUrl } from "./site";

export type OrderWithItems = Order & { items: OrderItem[] };

/** The customer's own order page (phone included, so it opens without asking). */
export function customerOrderUrl(o: Pick<Order, "orderNumber" | "phone">): string {
  return absoluteUrl(`/order/${o.orderNumber}?phone=${o.phone}`);
}

export function orderEmailData(o: OrderWithItems): OrderEmailData {
  return {
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    shippingFee: o.shippingFee,
    codFee: o.codFee,
    total: o.total,
    address: [
      o.customerName,
      o.addressLine1,
      ...(o.addressLine2 ? [o.addressLine2] : []),
      `${o.city}, ${o.state} ${o.pincode}`,
      o.phone,
    ],
    items: o.items.map((i) => ({
      productName: i.productName,
      size: i.size,
      image: i.image,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    orderUrl: customerOrderUrl(o),
  };
}
