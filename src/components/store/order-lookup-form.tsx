import Form from "next/form";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Plain GET form (works without JavaScript). Pass `orderNumber` to only ask for
 * the phone, e.g. on the order page.
 */
export function OrderLookupForm({
  action,
  orderNumber,
  defaultOrder,
  defaultPhone,
  error,
}: {
  action: string;
  orderNumber?: string;
  defaultOrder?: string;
  defaultPhone?: string;
  error?: string;
}) {
  return (
    <Form action={action} className="grid max-w-md gap-4">
      {orderNumber === undefined && (
        <div className="grid gap-1.5">
          <Label htmlFor="order">Order number</Label>
          <Input
            id="order"
            name="order"
            required
            defaultValue={defaultOrder}
            placeholder="e.g. AC1001"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Mobile number used for the order</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          defaultValue={defaultPhone}
          placeholder="10-digit mobile number"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "lookup-error" : undefined}
        />
      </div>
      {error && (
        <p id="lookup-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit">
        <SearchIcon aria-hidden />
        {orderNumber === undefined ? "Track order" : "View order"}
      </Button>
    </Form>
  );
}
