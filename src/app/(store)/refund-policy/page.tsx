import Link from "next/link";
import { InfoPage, infoPageMetadata } from "@/components/store/info-page";
import { DAMAGE_REPORT_HOURS, RETURN_WINDOW_DAYS } from "@/config/store";

// TODO(owner): this is a draft. Check every rule matches how you want to work.

export const metadata = infoPageMetadata(
  "/refund-policy",
  `Size exchange within ${RETURN_WINDOW_DAYS} days of delivery. Damaged or wrong items are replaced or refunded.`,
);

export default function RefundPolicyPage() {
  return (
    <InfoPage path="/refund-policy" showUpdated>
      <h2 className="mt-0!">Size exchange</h2>
      <p>
        If a kurti doesn&apos;t fit, you can exchange it for another size within{" "}
        <strong>{RETURN_WINDOW_DAYS} days of delivery</strong>, as long as that size is in stock.
      </p>
      <ul>
        <li>The item must be unused and unwashed, with its original tags and packaging.</li>
        <li>
          Message us on <Link href="/contact">WhatsApp</Link> with your order number and the size you need. We&apos;ll
          share the return address.
        </li>
        <li>You pay for sending the item back to us. We ship the new size free.</li>
        <li>If the size you need is out of stock, we refund the item price instead.</li>
      </ul>

      <h2>Damaged, defective or wrong item</h2>
      <p>We check every piece before packing. If something is still wrong, we&apos;ll fix it at no cost to you.</p>
      <ul>
        <li>
          Tell us within <strong>{DAMAGE_REPORT_HOURS} hours of delivery</strong> on{" "}
          <Link href="/contact">WhatsApp</Link>, with your order number and photos.
        </li>
        <li>An unboxing video, recorded while opening the parcel, helps us sort it out quickly.</li>
        <li>We&apos;ll send a replacement or give a full refund, including shipping charges.</li>
      </ul>

      <h2>What can&apos;t be returned or exchanged</h2>
      <ul>
        <li>Sarees, unless they are damaged, defective or wrong.</li>
        <li>Items that have been worn, washed, altered or stitched (for example, a blouse piece that has been cut).</li>
        <li>Items without their original tags or packaging.</li>
        <li>Items bought on sale, or marked as non-returnable on the product page.</li>
      </ul>

      <h2>Cancelling an order</h2>
      <p>
        You can cancel any time before your order ships. Just <Link href="/contact">message or call us</Link> with
        your order number. Once an order has shipped, it can&apos;t be cancelled, but the exchange rules above still
        apply.
      </p>

      <h2>How refunds are paid</h2>
      <ul>
        <li>Cash on Delivery orders are refunded by UPI or bank transfer. We&apos;ll ask for the details on WhatsApp.</li>
        <li>Refunds are sent within 5–7 business days after we receive and check the returned item.</li>
        <li>Shipping and Cash on Delivery charges are refunded only when the item was damaged, defective or wrong.</li>
      </ul>
    </InfoPage>
  );
}
