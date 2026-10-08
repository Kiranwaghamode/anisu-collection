import { ImageResponse } from "next/og";
import { brandImageOptions, ShareCard } from "@/lib/brand-image";

// Default link-preview image (see OG_DEFAULTS). Not an opengraph-image file on purpose:
// those would override the product photos used as previews on product pages.
export function GET() {
  return new ImageResponse(<ShareCard />, brandImageOptions({ width: 1200, height: 630 }));
}
