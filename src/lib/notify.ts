import "server-only";
import OrderPlaced from "@/emails/OrderPlaced";
import OrderShipped from "@/emails/OrderShipped";
import { STORE_NAME } from "@/config/store";
import { db } from "./db";
import { sendEmail } from "./email";
import { customerOrderUrl, orderEmailData } from "./notify-format";

// Every function here is called with after(), once the response has gone out,
// and never throws: notifications must not block or fail an order.

async function loadOrder(where: { orderNumber: string } | { id: string }) {
  return db.order.findUnique({ where, include: { items: true } });
}

/** New order: "order placed" email to the customer. (Owner Telegram alert: later, see PLAN.md.) */
export async function notifyOrderPlaced(orderNumber: string): Promise<void> {
  try {
    const o = await loadOrder({ orderNumber });
    if (!o) return;
    await sendEmail({
      to: o.email,
      subject: `Order ${o.orderNumber} placed · ${STORE_NAME}`,
      react: OrderPlaced(orderEmailData(o)),
    });
  } catch (err) {
    console.error("[notify] order placed failed", orderNumber, err);
  }
}

/** Owner marked the order shipped: tell the customer how to track it. */
export async function notifyOrderShipped(orderId: string): Promise<void> {
  try {
    const o = await loadOrder({ id: orderId });
    if (!o || o.status !== "SHIPPED") return;
    await sendEmail({
      to: o.email,
      subject: `Your order ${o.orderNumber} is on its way · ${STORE_NAME}`,
      react: OrderShipped({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        courierName: o.courierName,
        awbCode: o.awbCode,
        trackingUrl: o.trackingUrl,
        orderUrl: customerOrderUrl(o),
      }),
    });
  } catch (err) {
    console.error("[notify] order shipped failed", orderId, err);
  }
}
