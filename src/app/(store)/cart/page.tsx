import type { Metadata } from "next";
import { CartPage } from "@/components/store/cart-page";
import { PageTitle } from "@/components/store/page-title";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function Cart() {
  return (
    <div className="container-page pb-16">
      <PageTitle title="Your cart" />
      <CartPage />
    </div>
  );
}
