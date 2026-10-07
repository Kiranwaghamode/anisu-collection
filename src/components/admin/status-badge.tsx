import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/order-status";

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        STATUS_TONE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const paid = status === "PAID";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap",
        paid ? "border-emerald-300 text-emerald-800" : "border-border text-muted-foreground",
      )}
    >
      {method === "COD" ? (paid ? "COD · Paid" : "COD") : paid ? "Paid online" : "Online · unpaid"}
    </span>
  );
}
