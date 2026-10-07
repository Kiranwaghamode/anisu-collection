"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderAction } from "@/lib/admin/orders";
import { updateAdminNote, updateOrderStatus, type ShipmentForm } from "@/lib/actions/admin-orders";

type Btn = { action: OrderAction; label: string; variant: "default" | "outline" | "destructive" };

const BUTTONS: Partial<Record<OrderStatus, Btn[]>> = {
  PLACED: [
    { action: "confirm", label: "Confirm order", variant: "default" },
    { action: "cancel", label: "Cancel", variant: "destructive" },
  ],
  CONFIRMED: [
    { action: "ship", label: "Mark shipped", variant: "default" },
    { action: "cancel", label: "Cancel", variant: "destructive" },
  ],
  SHIPPED: [
    { action: "deliver", label: "Mark delivered", variant: "default" },
    { action: "rto", label: "Mark RTO", variant: "destructive" },
  ],
};

const CONFIRM_TEXT: Partial<Record<OrderAction, { title: string; body: string; cta: string }>> = {
  cancel: {
    title: "Cancel this order?",
    body: "The items go back into stock. This can't be undone.",
    cta: "Yes, cancel order",
  },
  rto: {
    title: "Mark as returned (RTO)?",
    body: "Use this when the courier couldn't deliver and the parcel came back to you. The items go back into stock.",
    cta: "Yes, mark RTO",
  },
};

export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<OrderAction | null>(null);
  const [shipping, setShipping] = useState(false);
  const [ship, setShip] = useState<ShipmentForm>({ courierName: "", awbCode: "", trackingUrl: "" });
  const buttons = BUTTONS[status];

  if (!buttons) return null;

  function run(action: OrderAction, shipment?: ShipmentForm) {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, action, shipment);
      if (res.ok) {
        toast.success("Order updated");
        setConfirming(null);
        setShipping(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function onClick(action: OrderAction) {
    if (action === "ship") setShipping(true);
    else if (CONFIRM_TEXT[action]) setConfirming(action);
    else run(action);
  }

  const confirmText = confirming ? CONFIRM_TEXT[confirming] : null;

  return (
    <>
      {/* Phones: big buttons pinned to the bottom; desktop: inline */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[2fr_1fr] gap-2.5 border-t border-border bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:static md:flex md:border-0 md:bg-transparent md:p-0">
        {buttons.map((b) => (
          <Button
            key={b.action}
            variant={b.variant}
            disabled={pending}
            onClick={() => onClick(b.action)}
            className="md:min-w-40"
          >
            {pending && b.variant === "default" && <Loader2Icon className="animate-spin" aria-hidden />}
            {b.label}
          </Button>
        ))}
      </div>

      <Dialog open={!!confirmText} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">{confirmText?.title}</DialogTitle>
            <DialogDescription>{confirmText?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)} disabled={pending}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={() => confirming && run(confirming)} disabled={pending}>
              {pending && <Loader2Icon className="animate-spin" aria-hidden />}
              {confirmText?.cta}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shipping} onOpenChange={setShipping}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Mark as shipped</DialogTitle>
            <DialogDescription>The customer sees these details on the track order page.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              run("ship", ship);
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="courierName">Courier</Label>
              <Input
                id="courierName"
                required
                placeholder="e.g. Delhivery, DTDC, India Post"
                value={ship.courierName}
                onChange={(e) => setShip({ ...ship, courierName: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="awbCode">Tracking number (AWB)</Label>
              <Input
                id="awbCode"
                required
                autoCapitalize="characters"
                spellCheck={false}
                value={ship.awbCode}
                onChange={(e) => setShip({ ...ship, awbCode: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="trackingUrl">
                Tracking link <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="trackingUrl"
                type="url"
                inputMode="url"
                placeholder="https://"
                value={ship.trackingUrl}
                onChange={(e) => setShip({ ...ship, trackingUrl: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShipping(false)} disabled={pending}>
                Back
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2Icon className="animate-spin" aria-hidden />}
                Mark shipped
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminNoteForm({ orderId, note }: { orderId: string; note: string | null }) {
  const [value, setValue] = useState(note ?? "");
  const [pending, startTransition] = useTransition();
  const dirty = value !== (note ?? "");

  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await updateAdminNote(orderId, value);
          if (res.ok) toast.success("Note saved");
          else toast.error(res.error);
        });
      }}
    >
      <Label htmlFor="adminNote">Admin note</Label>
      <textarea
        id="adminNote"
        rows={3}
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Only you can see this, e.g. “Called, confirmed for Friday”"
        className="w-full rounded-md border border-input bg-surface px-3.5 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" variant="outline" size="sm" disabled={!dirty || pending} className="justify-self-start">
        {pending && <Loader2Icon className="animate-spin" aria-hidden />}
        Save note
      </Button>
    </form>
  );
}
