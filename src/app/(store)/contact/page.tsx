import Link from "next/link";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/store/brand-icons";
import { InfoPage, infoPageMetadata } from "@/components/store/info-page";
import { STORE_ADDRESS, STORE_EMAIL, STORE_HOURS, STORE_INSTAGRAM, STORE_NAME, STORE_PHONE } from "@/config/store";
import { whatsappUrl } from "@/lib/site";

export const metadata = infoPageMetadata(
  "/contact",
  `Call, WhatsApp or email ${STORE_NAME}. We're happy to help with sizes, orders and delivery.`,
);

const CHANNELS = [
  { icon: WhatsAppIcon, label: "WhatsApp", value: "Chat with us", href: whatsappUrl("Hi! I have a question."), external: true },
  { icon: PhoneIcon, label: "Phone", value: STORE_PHONE, href: `tel:${STORE_PHONE.replace(/\s/g, "")}` },
  { icon: MailIcon, label: "Email", value: STORE_EMAIL, href: `mailto:${STORE_EMAIL}` },
  { icon: InstagramIcon, label: "Instagram", value: "Follow us", href: STORE_INSTAGRAM, external: true },
];

export default function ContactPage() {
  return (
    <InfoPage path="/contact" intro={`We reply ${STORE_HOURS}. WhatsApp is the quickest way to reach us.`}>
      <div className="divide-y divide-border rounded-md border border-border bg-surface">
        {CHANNELS.map(({ icon: Icon, label, value, href, external }) => (
          <a
            key={label}
            href={href}
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
            className="flex min-h-16 items-center gap-4 px-4 py-3 text-foreground! hover:no-underline! active:bg-muted"
          >
            <Icon className="size-5.5 shrink-0 text-accent" aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm font-normal text-muted-foreground">{label}</span>
              <span className="block font-normal break-all">{value}</span>
            </span>
          </a>
        ))}
        <div className="flex min-h-16 items-center gap-4 px-4 py-3">
          <MapPinIcon className="size-5.5 shrink-0 text-accent" aria-hidden />
          <span>
            <span className="block text-sm text-muted-foreground">Address</span>
            <span className="block text-foreground">{STORE_ADDRESS}</span>
          </span>
        </div>
      </div>

      <h2>About an order?</h2>
      <p>
        Please share your order number. It starts with AC and is in your confirmation email. You can also check your
        order&apos;s status yourself on the <Link href="/track">Track Order</Link> page.
      </p>
    </InfoPage>
  );
}
