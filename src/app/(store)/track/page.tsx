import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderLookupForm } from "@/components/store/order-lookup-form";
import { OrderStatus, formatOrderDate } from "@/components/store/order-status";
import { PageTitle } from "@/components/store/page-title";
import { findOrderForCustomer } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your order with your order number and mobile number.",
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function TrackContent({ searchParams }: Pick<PageProps<"/track">, "searchParams">) {
  const sp = await searchParams;
  const orderNumber = first(sp.order)?.trim().slice(0, 20);
  const phone = first(sp.phone)?.trim().slice(0, 20);
  const order = orderNumber && phone ? await findOrderForCustomer(orderNumber, phone) : null;
  const notFound = !!orderNumber && !!phone && !order;

  return (
    <>
      <OrderLookupForm
        action="/track"
        defaultOrder={orderNumber}
        defaultPhone={phone}
        error={notFound ? "We couldn't find an order with that number and mobile number." : undefined}
      />

      {order && (
        <section className="mt-10 max-w-xl rounded-md border border-border bg-surface p-5 md:p-6" aria-live="polite">
          <h2 className="text-2xl">Order {order.orderNumber}</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Placed on {formatOrderDate(order.createdAt)}</p>
          <OrderStatus order={order} />
          <Link
            href={`/order/${order.orderNumber}?phone=${order.phone}`}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            View order details
          </Link>
        </section>
      )}
    </>
  );
}

export default function TrackPage({ searchParams }: PageProps<"/track">) {
  return (
    <div className="container-page pb-16">
      <PageTitle
        title="Track your order"
        subtitle="Enter your order number (from your confirmation) and the mobile number you ordered with."
      />
      <Suspense fallback={<OrderLookupForm action="/track" />}>
        <TrackContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
