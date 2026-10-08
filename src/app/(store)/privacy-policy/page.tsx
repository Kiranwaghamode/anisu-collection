import Link from "next/link";
import { InfoPage, infoPageMetadata } from "@/components/store/info-page";
import { GRIEVANCE_OFFICER, STORE_ADDRESS, STORE_EMAIL, STORE_NAME, STORE_PHONE } from "@/config/store";

// TODO(owner): this is a draft, not legal advice. Have it checked if you can.

export const metadata = infoPageMetadata(
  "/privacy-policy",
  `How ${STORE_NAME} collects, uses and protects your personal information.`,
);

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      path="/privacy-policy"
      intro={`This policy explains what personal information ${STORE_NAME} collects when you shop with us, and how we use and protect it.`}
      showUpdated
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Order details:</strong> your name, mobile number, email address and delivery address, and what you
          ordered.
        </li>
        <li>
          <strong>Messages:</strong> anything you send us by WhatsApp, phone or email.
        </li>
        <li>
          <strong>Your cart:</strong> stored only in your own browser, so it&apos;s still there when you come back. We
          don&apos;t see it until you place an order.
        </li>
      </ul>
      <p>
        We don&apos;t collect card or bank details on this website, and we don&apos;t use advertising or tracking
        cookies.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To process, pack and deliver your order, and to contact you about it.</li>
        <li>To send order emails, such as your order confirmation and shipping updates.</li>
        <li>To handle exchanges, refunds and your questions.</li>
        <li>To meet our legal and tax obligations.</li>
      </ul>
      <p>We never sell your personal information, and we don&apos;t send marketing messages without your consent.</p>

      <h2>Who we share it with</h2>
      <p>Only with the services we need to run the shop, and only what each one needs:</p>
      <ul>
        <li>Courier partners, to deliver your order (name, address and mobile number).</li>
        <li>Our email provider, to send order emails.</li>
        <li>Our website hosting and database providers, which store order records securely.</li>
        <li>Government authorities, when the law requires it.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        We keep order records for as long as needed to serve you and to meet tax and accounting requirements, usually
        up to 8 years. After that, we delete them.
      </p>

      <h2>Your rights</h2>
      <p>
        Under India&apos;s Digital Personal Data Protection Act, 2023, you can ask us to see, correct or delete your
        personal information, or withdraw your consent. Email us at <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a>{" "}
        and we&apos;ll respond within 30 days. We may need to keep some records where the law requires it.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        Our website uses a secure (HTTPS) connection, and order information can only be viewed by the store owner and
        by you, using your order number and mobile number.
      </p>

      <h2>Grievance Officer</h2>
      <p>
        If you have a concern about your personal information or an order, please contact our Grievance Officer:
        <br />
        <strong>{GRIEVANCE_OFFICER}</strong>, {STORE_NAME}
        <br />
        {STORE_ADDRESS}
        <br />
        Email: <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a> · Phone: {STORE_PHONE}
      </p>
      <p>We acknowledge complaints within 48 hours and resolve them within one month.</p>

      <h2>Changes to this policy</h2>
      <p>
        If we update this policy, we&apos;ll change the date below. See also our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    </InfoPage>
  );
}
