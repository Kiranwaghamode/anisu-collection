import { CheckIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerOrder } from "@/lib/orders";

const STEPS = [
  { status: "PLACED", label: "Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
] as const;

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function formatOrderDate(d: Date) {
  return dateFmt.format(d);
}

/** Placed → Confirmed → Shipped → Delivered, plus courier details once shipped. */
export function OrderStatus({ order }: { order: CustomerOrder }) {
  if (order.status === "CANCELLED" || order.status === "RTO") {
    return (
      <div className="rounded-md border border-border bg-muted p-4">
        <p className="font-semibold">{order.status === "CANCELLED" ? "Order cancelled" : "Returned to us"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.status === "CANCELLED"
            ? "This order has been cancelled. Contact us if you have any questions."
            : "The courier couldn't deliver this order and it has come back to us. Contact us to arrange delivery."}
        </p>
      </div>
    );
  }

  if (order.status === "PENDING_PAYMENT") {
    return (
      <div className="rounded-md border border-border bg-muted p-4">
        <p className="font-semibold">Awaiting payment</p>
        <p className="mt-1 text-sm text-muted-foreground">We haven&apos;t received the payment for this order yet.</p>
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.status === order.status);
  const shipped = current >= 2;

  return (
    <div>
      <ol className="grid grid-cols-4" aria-label="Order progress">
        {STEPS.map((step, i) => {
          const done = i <= current;
          return (
            <li key={step.status} className="relative flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
              {i > 0 && (
                <span
                  className={cn("absolute top-3.5 right-1/2 h-0.5 w-full", i <= current ? "bg-accent" : "bg-border")}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative flex size-7 items-center justify-center rounded-full border-2",
                  done ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface",
                )}
              >
                {done && <CheckIcon className="size-4" strokeWidth={3} aria-hidden />}
              </span>
              <span className={cn("mt-2 text-xs md:text-sm", done ? "font-semibold" : "text-muted-foreground")}>
                {step.label}
                <span className="sr-only">{done ? " (done)" : " (pending)"}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {shipped && (order.courierName || order.awbCode || order.trackingUrl) && (
        <div className="mt-5 rounded-md border border-border bg-surface p-4 text-sm">
          {order.courierName && (
            <p>
              <span className="text-muted-foreground">Courier: </span>
              <span className="font-medium">{order.courierName}</span>
            </p>
          )}
          {order.awbCode && (
            <p className="mt-0.5">
              <span className="text-muted-foreground">Tracking number: </span>
              <span className="font-medium">{order.awbCode}</span>
            </p>
          )}
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline"
            >
              Track your shipment
              <ExternalLinkIcon className="size-4" aria-hidden />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
