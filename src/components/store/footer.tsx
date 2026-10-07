import Link from "next/link";
import { cacheLife } from "next/cache";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import {
  STORE_ADDRESS,
  STORE_EMAIL,
  STORE_INSTAGRAM,
  STORE_NAME,
  STORE_PHONE,
  STORE_TAGLINE,
  STORE_WHATSAPP,
} from "@/config/store";
import { helpNav, mainNav, policyNav } from "@/config/nav";
import { InstagramIcon, WhatsAppIcon } from "./brand-icons";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold tracking-[0.14em] text-foreground uppercase">{title}</h2>
      <ul className="mt-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-11 items-center text-[0.95rem] text-muted-foreground transition-colors hover:text-accent md:min-h-9"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const year = await currentYear();
  const tel = STORE_PHONE.replace(/\s/g, "");

  return (
    <footer className="mt-auto border-t border-border bg-surface pb-safe">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:gap-12">
          <div>
            <Link href="/" className="inline-flex min-h-11 items-center font-heading text-3xl font-semibold tracking-tight">
              {STORE_NAME}
            </Link>
            <p className="mt-2 max-w-xs text-[0.95rem] text-muted-foreground">
              {STORE_TAGLINE}, delivered across India.
            </p>
            <div className="mt-4 -ml-3 flex">
              <a
                href={STORE_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="tap flex items-center justify-center rounded-md text-foreground transition-colors hover:text-accent"
              >
                <InstagramIcon className="size-5.5" />
              </a>
              <a
                href={`https://wa.me/${STORE_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="tap flex items-center justify-center rounded-md text-foreground transition-colors hover:text-accent"
              >
                <WhatsAppIcon className="size-5.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:contents">
            <FooterColumn title="Shop" links={mainNav} />
            <FooterColumn title="Help" links={helpNav} />
            <div className="col-span-2 md:col-span-1">
              <FooterColumn title="Policies" links={policyNav} />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-1 border-t border-border pt-8 text-[0.95rem] text-muted-foreground md:grid-cols-3 md:gap-6">
          <a href={`tel:${tel}`} className="flex min-h-11 items-center gap-3 hover:text-accent">
            <PhoneIcon className="size-4.5 shrink-0" />
            {STORE_PHONE}
          </a>
          <a href={`mailto:${STORE_EMAIL}`} className="flex min-h-11 items-center gap-3 break-all hover:text-accent">
            <MailIcon className="size-4.5 shrink-0" />
            {STORE_EMAIL}
          </a>
          <p className="flex min-h-11 items-center gap-3">
            <MapPinIcon className="size-4.5 shrink-0" />
            {STORE_ADDRESS}
          </p>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          © {year} {STORE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
