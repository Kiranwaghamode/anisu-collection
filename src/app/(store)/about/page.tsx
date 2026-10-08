import Link from "next/link";
import { InfoPage, infoPageMetadata } from "@/components/store/info-page";
import { STORE_NAME } from "@/config/store";

// TODO(owner): this is a draft. Tell your own story here.

export const metadata = infoPageMetadata(
  "/about",
  `${STORE_NAME} brings you handpicked silk and cotton sarees and kurtis, checked by hand and delivered across India.`,
);

export default function AboutPage() {
  return (
    <InfoPage path="/about" intro="Woven with care, chosen with love.">
      <p>
        {STORE_NAME} began with a simple idea: beautiful sarees and kurtis, picked one by one from trusted weavers and
        makers, at fair prices. We are a small, family-run shop, and we choose every piece as if we were buying it for
        ourselves.
      </p>

      <h2>What we sell</h2>
      <p>
        Silk sarees for weddings and festivals, soft cotton sarees for every day, and kurtis for the office, parties and
        everything in between. Each product page lists the fabric, colour and care details, and the photos show the
        real piece.
      </p>

      <h2>Our promise</h2>
      <ul>
        <li>
          <strong>Checked by hand.</strong> Every piece is inspected before it is packed.
        </li>
        <li>
          <strong>Cash on Delivery.</strong> Pay when your order arrives.
        </li>
        <li>
          <strong>Easy exchange.</strong> If the size isn&apos;t right, we&apos;ll help. See our{" "}
          <Link href="/refund-policy">Refund &amp; Exchange Policy</Link>.
        </li>
        <li>
          <strong>Real people to talk to.</strong> Questions about a product? <Link href="/contact">Message us</Link>{" "}
          and we&apos;ll reply.
        </li>
      </ul>

      <p className="mt-8!">
        <Link href="/sarees">Shop sarees</Link> · <Link href="/kurtis">Shop kurtis</Link>
      </p>
    </InfoPage>
  );
}
