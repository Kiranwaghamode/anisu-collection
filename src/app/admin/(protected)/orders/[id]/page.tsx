import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, ExternalLinkIcon, PhoneIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppIcon } from "@/components/store/brand-icons";
import { formatOrderDate } from "@/components/store/order-status";
import { CopyButton } from "@/components/admin/copy-button";
import { AdminNoteForm, OrderActions } from "@/components/admin/order-actions";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { SAREE_SIZE, STORE_NAME } from "@/config/store";
import { requireAdmin } from "@/lib/auth";
import { getAdminOrder, type AdminOrder } from "@/lib/admin/orders";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = { title: "Order" };

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border py-1.5 last:border-0">
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words">{value}</dd>
      </div>
      {copy && <CopyButton value={value} label={label.toLowerCase()} />}
    </div>
  );
}

function whatsappMessage(o: AdminOrder) {
  const name = o.customerName.split(" ")[0];
  if (o.status === "PLACED" && o.paymentMethod === "COD") {
    return `Hi ${name}, this is ${STORE_NAME}. Thank you for your order ${o.orderNumber} (${formatINR(o.total)}, Cash on Delivery). Could you please confirm the order and delivery address?`;
  }
  if (o.status === "SHIPPED" && o.awbCode) {
    return `Hi ${name}, your ${STORE_NAME} order ${o.orderNumber} has been shipped with ${o.courierName ?? "our courier"}. Tracking number: ${o.awbCode}${o.trackingUrl ? ` (${o.trackingUrl})` : ""}.`;
  }
  return `Hi ${name}, this is ${STORE_NAME} about your order ${o.orderNumber}.`;
}

async function OrderDetail({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const o = await getAdminOrder(id);
  if (!o) notFound();

  const address = [o.addressLine1, o.addressLine2, `${o.city}, ${o.state} ${o.pincode}`].filter(Boolean).join(", ");
  const fullAddress = `${o.customerName}\n${address}\n${o.phone}`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-3xl md:text-4xl">{o.orderNumber}</h1>
        <StatusBadge status={o.status} />
        <PaymentBadge method={o.paymentMethod} status={o.paymentStatus} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Placed {formatOrderDate(o.createdAt)}</p>

      {/* Pinned to the bottom on phones, inline on desktop */}
      <div className="md:mt-5">
        <OrderActions orderId={o.id} status={o.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="grid gap-6">
          <section className="rounded-md border border-border bg-surface p-4 md:p-5">
            <h2 className="text-2xl">Items</h2>
            <ul className="mt-2 divide-y divide-border">
              {o.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3">
                  <div className="relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-sm bg-muted">
                    {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <Link
                      href={`/product/${item.variant.product.slug}`}
                      target="_blank"
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {item.productName}
                    </Link>
                    {item.size !== SAREE_SIZE && <p className="font-semibold">Size {item.size}</p>}
                    <p className="text-muted-foreground">
                      {item.quantity} × {formatINR(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatINR(item.unitPrice * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatINR(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{o.shippingFee === 0 ? "Free" : formatINR(o.shippingFee)}</dd>
              </div>
              {o.codFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">COD fee</dt>
                  <dd>{formatINR(o.codFee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>{o.paymentMethod === "COD" && o.paymentStatus !== "PAID" ? "To collect" : "Total"}</dt>
                <dd>{formatINR(o.total)}</dd>
              </div>
            </dl>
          </section>

          {(o.courierName || o.awbCode) && (
            <section className="rounded-md border border-border bg-surface p-4 md:p-5">
              <h2 className="text-2xl">Shipment</h2>
              <dl className="mt-2 text-sm">
                {o.courierName && <Row label="Courier" value={o.courierName} />}
                {o.awbCode && <Row label="Tracking number" value={o.awbCode} copy />}
              </dl>
              {o.trackingUrl && (
                <a
                  href={o.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent"
                >
                  Open tracking page <ExternalLinkIcon className="size-4" aria-hidden />
                </a>
              )}
            </section>
          )}

          <section className="rounded-md border border-border bg-surface p-4 md:p-5">
            <AdminNoteForm key={o.adminNote ?? ""} orderId={o.id} note={o.adminNote} />
          </section>
        </div>

        {/* First on phones: calling the customer is the usual next step */}
        <section className="order-first rounded-md border border-border bg-surface p-4 md:p-5 lg:order-none">
          <h2 className="text-2xl">Customer</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <a
              href={`tel:+91${o.phone}`}
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium"
            >
              <PhoneIcon className="size-4.5" aria-hidden /> Call
            </a>
            <a
              href={`https://wa.me/91${o.phone}?text=${encodeURIComponent(whatsappMessage(o))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium"
            >
              <WhatsAppIcon className="size-5 text-[#25D366]" /> WhatsApp
            </a>
          </div>
          <dl className="mt-3 text-sm">
            <Row label="Name" value={o.customerName} copy />
            <Row label="Phone" value={o.phone} copy />
            <Row label="Email" value={o.email} copy />
            <Row label="Address" value={address} />
            <Row label="Pincode" value={o.pincode} copy />
          </dl>
          <div className="mt-2 flex items-center justify-between rounded-md bg-muted px-3 text-sm">
            <span>Copy full address (for the parcel)</span>
            <CopyButton value={fullAddress} label="full address" />
          </div>
        </section>
      </div>

    </>
  );
}

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <>
      <Link href="/admin" className="-ml-2 mb-3 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden /> All orders
      </Link>
      <Suspense
        fallback={
          <div className="grid gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        }
      >
        <OrderDetail params={params} />
      </Suspense>
    </>
  );
}
