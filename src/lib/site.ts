import { STORE_WHATSAPP } from "@/config/store";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** wa.me link, optionally with a prefilled message. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${STORE_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
