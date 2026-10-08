import Link from "next/link";
import { InfoPage, infoPageMetadata } from "@/components/store/info-page";
import {
  GRIEVANCE_OFFICER,
  STORE_ADDRESS,
  STORE_EMAIL,
  STORE_JURISDICTION,
  STORE_NAME,
  STORE_PHONE,
} from "@/config/store";
import { SITE_URL } from "@/lib/site";

// TODO(owner): this is a draft, not legal advice. Have it checked if you can.

export const metadata = infoPageMetadata("/terms", `The terms for shopping on ${STORE_NAME}.`);

export default function TermsPage() {
  const site = SITE_URL.replace(/^https?:\/\//, "");
  return (
    <InfoPage
      path="/terms"
      intro={`These terms apply when you use ${site} or buy from ${STORE_NAME}. By placing an order, you agree to them.`}
      showUpdated
    >
      <h2>About us</h2>
      <p>
        {STORE_NAME} is an online shop based at {STORE_ADDRESS}, India, selling sarees and kurtis. You can reach us
        at <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a> or {STORE_PHONE}.
      </p>

      <h2>Products and prices</h2>
      <ul>
        <li>
          We try to show every product accurately. Colours can look slightly different on different screens, and
          handloom pieces can have small variations in weave. These are part of their character, not defects.
        </li>
        <li>All prices are in Indian Rupees (₹) and include applicable taxes.</li>
        <li>Shipping and Cash on Delivery charges are shown before you place your order.</li>
        <li>
          If a product is listed at a clearly wrong price, or turns out to be out of stock, we may cancel the order and
          will tell you straight away. If you&apos;ve paid anything, it is refunded in full.
        </li>
      </ul>

      <h2>Orders</h2>
      <ul>
        <li>
          Your order is confirmed when you receive an order number. We may contact you by phone or WhatsApp to verify a
          Cash on Delivery order before shipping it.
        </li>
        <li>
          We may refuse or cancel an order if the details look incorrect or fraudulent, or if a product can&apos;t be
          delivered to your pincode.
        </li>
        <li>Please give a correct address and mobile number. We can&apos;t be responsible for delays caused by wrong details.</li>
      </ul>

      <h2>Payment</h2>
      <p>
        We currently accept Cash on Delivery. Please pay the courier the exact amount shown in your order confirmation.
      </p>

      <h2>Shipping, exchanges and refunds</h2>
      <p>
        These are covered in our <Link href="/shipping-policy">Shipping Policy</Link> and{" "}
        <Link href="/refund-policy">Refund &amp; Exchange Policy</Link>, which are part of these terms.
      </p>

      <h2>Use of this website</h2>
      <ul>
        <li>The photos, text and design on this website belong to {STORE_NAME}. Please don&apos;t copy them without permission.</li>
        <li>Please don&apos;t misuse the website, for example by placing fake orders or trying to access other people&apos;s orders.</li>
      </ul>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, our responsibility for any order is limited to the amount you paid for it. Nothing
        in these terms limits your rights under the Consumer Protection Act, 2019.
      </p>

      <h2>Your privacy</h2>
      <p>
        How we handle your personal information is explained in our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>Complaints</h2>
      <p>
        If you have a complaint, please contact our Grievance Officer, <strong>{GRIEVANCE_OFFICER}</strong>, at{" "}
        <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a> or {STORE_PHONE}. We acknowledge complaints within 48 hours
        and resolve them within one month.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India. Any dispute is subject to the courts at {STORE_JURISDICTION}.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. The version shown here when you place an order applies to that order.</p>
    </InfoPage>
  );
}
