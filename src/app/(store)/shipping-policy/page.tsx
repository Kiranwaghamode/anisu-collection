import Link from "next/link";
import { InfoPage, infoPageMetadata } from "@/components/store/info-page";
import {
  COD_FEE,
  COD_MAX_ORDER_VALUE,
  DISPATCH_DAYS,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  TRANSIT_DAYS,
} from "@/config/store";
import { formatINR } from "@/lib/money";

export const metadata = infoPageMetadata(
  "/shipping-policy",
  `Delivery across India. Free shipping above ${formatINR(FREE_SHIPPING_THRESHOLD)}, Cash on Delivery available.`,
);

export default function ShippingPolicyPage() {
  return (
    <InfoPage path="/shipping-policy" showUpdated>
      <h2 className="mt-0!">Where we deliver</h2>
      <p>We deliver to most pincodes across India through trusted courier partners.</p>

      <h2>Shipping charges</h2>
      <ul>
        <li>
          <strong>Free shipping</strong> on orders of {formatINR(FREE_SHIPPING_THRESHOLD)} or more.
        </li>
        <li>
          Orders below {formatINR(FREE_SHIPPING_THRESHOLD)}: {formatINR(SHIPPING_FEE)} shipping.
        </li>
        <li>
          Cash on Delivery: an extra {formatINR(COD_FEE)} handling fee. Cash on Delivery is available on orders up to{" "}
          {formatINR(COD_MAX_ORDER_VALUE)}. For larger orders, please <Link href="/contact">contact us</Link> on
          WhatsApp.
        </li>
      </ul>
      <p>The full amount, including any charges, is shown before you place your order.</p>

      <h2>How long it takes</h2>
      <ul>
        <li>
          We pack your order and hand it to the courier within{" "}
          <strong>
            {DISPATCH_DAYS.min}–{DISPATCH_DAYS.max} business days
          </strong>
          .
        </li>
        <li>
          Delivery usually takes{" "}
          <strong>
            {TRANSIT_DAYS.min}–{TRANSIT_DAYS.max} business days
          </strong>{" "}
          after that, depending on your location.
        </li>
        <li>Festivals, weather or remote locations can sometimes cause delays. We&apos;ll keep you informed.</li>
      </ul>

      <h2>Tracking your order</h2>
      <p>
        When your order ships, we email you the courier name and tracking number. You can also check its status
        anytime on the <Link href="/track">Track Order</Link> page with your order number and mobile number.
      </p>

      <h2>If delivery fails</h2>
      <p>
        Please make sure your address, pincode and mobile number are correct, and that someone is available to receive
        the parcel. If a Cash on Delivery order is refused, or can&apos;t be delivered after several attempts, it comes
        back to us and is cancelled. After repeated refused deliveries, we may ask for payment in advance on future
        orders.
      </p>

      <h2>Damaged parcel?</h2>
      <p>
        If the outer packaging looks opened or badly damaged, please don&apos;t accept it, or record a video while
        opening it. See our <Link href="/refund-policy">Refund &amp; Exchange Policy</Link> for what to do next.
      </p>
    </InfoPage>
  );
}
