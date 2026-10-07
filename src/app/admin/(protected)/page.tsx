import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { formatOrderDate } from "@/components/store/order-status";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_ORDERS_PAGE, listOrders } from "@/lib/admin/orders";
import { formatINR } from "@/lib/money";
import { ORDER_TABS, type OrderTab } from "@/lib/order-status";

export const metadata: Metadata = { title: "Orders" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function href(tab: OrderTab, q?: string, page = 1) {
  const sp = new URLSearchParams();
  if (tab !== "placed") sp.set("tab", tab);
  if (q) sp.set("q", q);
  if (page > 1) sp.set("page", String(page));
  const s = sp.toString();
  return s ? `/admin?${s}` : "/admin";
}

async function Orders({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const rawTab = first(sp.tab);
  const tab: OrderTab = ORDER_TABS.some((t) => t.value === rawTab) ? (rawTab as OrderTab) : "placed";
  const q = first(sp.q)?.trim().slice(0, 40) || undefined;
  const page = Math.min(Math.max(Number.parseInt(first(sp.page) ?? "1", 10) || 1, 1), 20);
  const { orders, total, newCount } = await listOrders({ tab, q, page });

  return (
    <>
      <Form action="/admin" className="relative mt-4 max-w-md">
        {tab !== "placed" && <input type="hidden" name="tab" value={tab} />}
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Order number or phone"
          aria-label="Search orders"
          className="h-12 w-full rounded-md border border-border bg-surface pr-3 pl-10 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </Form>

      <nav aria-label="Order status" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {ORDER_TABS.map((t) => (
          <Link
            key={t.value}
            href={href(t.value, q)}
            aria-current={t.value === tab ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium",
              t.value === tab ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface",
            )}
          >
            {t.label}
            {t.value === "placed" && newCount > 0 && (
              <span
                className={cn(
                  "flex min-w-5 items-center justify-center rounded-full px-1 text-xs",
                  t.value === tab ? "bg-white/25" : "bg-accent text-accent-foreground",
                )}
              >
                {newCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          {q ? `No orders match “${q}”.` : "No orders here yet."}
        </p>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="mt-5 grid gap-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="block rounded-md border border-border bg-surface p-4 active:bg-muted">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1.5 text-sm">
                    {o.customerName} · {o.city}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{formatOrderDate(o.createdAt)}</span>
                    <span className="flex items-center gap-2">
                      <PaymentBadge method={o.paymentMethod} status={o.paymentStatus} />
                      <span className="font-semibold">{formatINR(o.total)}</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-6 hidden overflow-hidden rounded-md border border-border bg-surface md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="relative hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/admin/orders/${o.id}`} className="after:absolute after:inset-0">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatOrderDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      {o.customerName}
                      <span className="block text-xs text-muted-foreground">{o.city}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{o.phone}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatINR(o.total)}</td>
                    <td className="px-4 py-3">
                      <PaymentBadge method={o.paymentMethod} status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="pr-3 text-muted-foreground">
                      <ChevronRightIcon className="size-4" aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length < total && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Showing {orders.length} of {total}
              </p>
              <Button asChild variant="outline">
                <Link href={href(tab, q, page + 1)} scroll={false}>
                  Load more
                </Link>
              </Button>
            </div>
          )}
          {orders.length >= total && total > ADMIN_ORDERS_PAGE && (
            <p className="mt-6 text-center text-sm text-muted-foreground">All {total} orders shown.</p>
          )}
        </>
      )}
    </>
  );
}

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <h1 className="text-3xl md:text-4xl">Orders</h1>
      <Suspense
        fallback={
          <div className="mt-4 grid gap-3">
            <Skeleton className="h-12 max-w-md" />
            <Skeleton className="h-11 w-full max-w-xl" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        }
      >
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}
