"use client";

import Link from "next/link";
import { ChevronRightIcon, PhoneIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { STORE_NAME, STORE_PHONE, STORE_WHATSAPP } from "@/config/store";
import { helpNav, mainNav } from "@/config/nav";
import { WhatsAppIcon } from "./brand-icons";

// Bottom sheet so every link sits within thumb reach (BUILD_PLAN 1A).
export function MobileMenu({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-t-2xl pb-safe">
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border" aria-hidden />
        <SheetHeader className="px-5 pt-3 pb-2">
          <SheetTitle className="font-heading text-2xl font-semibold">{STORE_NAME}</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="overflow-y-auto px-5 pb-4">
          <ul className="divide-y divide-border border-y border-border">
            {mainNav.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="flex min-h-14 items-center justify-between font-heading text-xl font-medium"
                  >
                    {item.label}
                    <ChevronRightIcon className="size-5 text-muted-foreground" />
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>

          <ul className="mt-2 grid grid-cols-2 gap-x-4">
            {helpNav.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link href={item.href} className="flex min-h-11 items-center text-muted-foreground">
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${STORE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium"
            >
              <WhatsAppIcon className="size-5 text-[#25D366]" />
              WhatsApp
            </a>
            <a
              href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium"
            >
              <PhoneIcon className="size-4.5" />
              Call us
            </a>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
