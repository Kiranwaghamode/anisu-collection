import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { STORE_NAME, STORE_TAGLINE } from "@/config/store";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${STORE_NAME} | ${STORE_TAGLINE}`,
    template: `%s | ${STORE_NAME}`,
  },
  description:
    "Shop handpicked silk and cotton sarees and kurtis online. Cash on Delivery and free shipping above ₹999 across India.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets env(safe-area-inset-*) work on notched phones
  themeColor: "#FAF7F2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
