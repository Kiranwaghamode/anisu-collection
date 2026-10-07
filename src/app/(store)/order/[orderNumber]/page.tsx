import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CircleCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderLookupForm } from "@/components/store/order-lookup-form";
import { OrderStatus, formatOrderDate } from "@/components/store/order-status";
import { SAREE_SIZE } from "@/config/store";
import { formatINR } from "@/lib/money";
import { findOrderForCustomer, type CustomerOrder } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function OrderDetails({ order }: { order: CustomerOrder }) {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-12">
      <section>
        <h2 className="text-2xl">Items</h2>
        <ul className="mt-2 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3.5 py-4">
              <div className="relative aspect-4/5 w-18 shrink-0 overflow-hidden rounded-sm bg-muted">
                {item.image && <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{item.productName}</p>
                {item.size !== SAREE_SIZE && <p className="text-muted-foreground">Size {item.size}</p>}
                <p className="text-muted-foreground">
                  {item.quantity} × {formatINR(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-medium">{formatINR(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatINR(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</dd>
          </div>
          {order.codFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cash on Delivery fee</dt>
              <dd>{formatINR(order.codFee)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-6 text-sm">
        <div>
          <h2 className="text-2xl">Payment</h2>
          <p className="mt-2">
            {order.paymentMethod === "COD"
              ? `Cash on Delivery: please keep ${formatINR(order.total)} ready.`
              : order.paymentStatus === "PAID"
                ? "Paid online"
                : "Online payment"}
          </p>
        </div>
        <div>
          <h2 className="text-2xl">Delivery address</h2>
          <address className="mt-2 leading-relaxed not-italic">
            {order.customerName}
            <br />
            {order.addressLine1}
            {order.addressLine2 && (
              <>
                <br />
                {order.addressLine2}
              </>
            )}
            <br />
            {order.city}, {order.state} {order.pincode}
            <br />
            {order.phone}
          </address>
        </div>
      </section>
    </div>
  );
}

async function OrderContent({ params, searchParams }: PageProps<"/order/[orderNumber]">) {
  const [{ orderNumber: raw }, sp] = await Promise.all([params, searchParams]);
  const orderNumber = decodeURIComponent(raw).toUpperCase();
  const phone = first(sp.phone)?.slice(0, 20);
  const order = phone ? await findOrderForCustomer(orderNumber, phone) : null;

  if (!order) {
    return (
      <div className="py-6 md:py-12">
        <h1 className="text-[2rem] md:text-5xl">Order {orderNumber}</h1>
        <p className="mt-2 mb-6 text-muted-foreground">
          To keep your details private, enter the mobile number you used for this order.
        </p>
        <OrderLookupForm
          action={`/order/${encodeURIComponent(orderNumber)}`}
          orderNumber={orderNumber}
          defaultPhone={phone}
          error={phone ? "That mobile number doesn't match this order." : undefined}
        />
      </div>
    );
  }

  const justPlaced = order.status === "PLACED" || order.status === "PENDING_PAYMENT";

  return (
    <div className="py-6 md:py-12">
      {justPlaced ? (
        <div className="flex flex-col items-start gap-3">
          <CircleCheckIcon className="size-10 text-accent" strokeWidth={1.5} aria-hidden />
          <h1 className="text-[2rem] md:text-5xl">Thank you, {order.customerName.split(" ")[0]}!</h1>
          <p className="text-lg">
            Your order <span className="font-semibold">{order.orderNumber}</span> is placed.
          </p>
        </div>
      ) : (
        <h1 className="text-[2rem] md:text-5xl">Order {order.orderNumber}</h1>
      )}
      <p className="mt-1 text-sm text-muted-foreground">
        Placed on {formatOrderDate(order.createdAt)}
        {order.paymentMethod === "COD" && order.status === "PLACED" && " · We'll call you shortly to confirm it."}
      </p>

      <div className="mt-8 max-w-xl">
        <OrderStatus order={order} />
      </div>

      <OrderDetails order={order} />

      <div className="mt-10 grid max-w-sm grid-cols-2 gap-3">
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/track">Track order</Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderPage(props: PageProps<"/order/[orderNumber]">) {
  return (
    <div className="container-page pb-16">
      <Suspense
        fallback={
          <div className="py-6 md:py-12">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-4 h-5 w-48" />
            <Skeleton className="mt-8 h-16 w-full max-w-xl" />
          </div>
        }
      >
        <OrderContent {...props} />
      </Suspense>
    </div>
  );
}
