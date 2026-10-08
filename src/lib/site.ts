import type { Metadata } from "next";
import { STORE_NAME, STORE_WHATSAPP } from "@/config/store";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** wa.me link, optionally with a prefilled message. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${STORE_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Open Graph fields every page shares. A page that sets `openGraph` replaces the
 * parent's object entirely, so spread this into it.
 */
export const OG_DEFAULTS = {
  siteName: STORE_NAME,
  locale: "en_IN",
  type: "website" as const,
  images: [{ url: "/og.png", width: 1200, height: 630, alt: STORE_NAME }],
} satisfies Metadata["openGraph"];
