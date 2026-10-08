import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { checkoutSchema } from "@/lib/checkout";
import { CATALOG_TAG } from "@/lib/catalog";
import { notifyOrderPlaced } from "@/lib/notify";
import { CheckoutError, placeCodOrder } from "@/lib/orders";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return Response.json(
      { error: first?.message ?? "Please check your details.", field: first?.path.join(".") },
      { status: 400 },
    );
  }

  try {
    const { orderNumber } = await placeCodOrder(parsed.data);
    // Stock changed, so sold-out badges and size buttons need fresh data.
    revalidateTag(CATALOG_TAG, "max");
    // Confirmation email, sent after the customer already has their response.
    after(() => notifyOrderPlaced(orderNumber));
    return Response.json({ orderNumber }, { status: 201 });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    console.error("checkout failed", err);
    return Response.json(
      { error: "Something went wrong while placing your order. Please try again." },
      { status: 500 },
    );
  }
}
