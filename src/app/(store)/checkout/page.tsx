import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { PageTitle } from "@/components/store/page-title";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page pb-16">
      <PageTitle title="Checkout" />
      <CheckoutForm />
    </div>
  );
}
