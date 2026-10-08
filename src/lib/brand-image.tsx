// Brand artwork drawn with next/og, for the site icons and the default link preview.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { STORE_NAME, STORE_TAGLINE } from "@/config/store";

const cormorant = await readFile(join(process.cwd(), "assets/CormorantGaramond-SemiBold.ttf"));

/** ImageResponse options: the size plus the site's heading font. */
export function brandImageOptions(size: { width: number; height: number }) {
  return { ...size, fonts: [{ name: "Cormorant Garamond", data: cormorant, weight: 600 as const, style: "normal" as const }] };
}

const ACCENT = "#7a1e2c";
const BACKGROUND = "#faf7f2";

/** Square monogram: the first letter of the store name on maroon. */
export function Monogram({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ACCENT,
        color: BACKGROUND,
        fontFamily: "Cormorant Garamond",
        fontSize: size * 0.62,
        lineHeight: 1,
      }}
    >
      {STORE_NAME[0]}
    </div>
  );
}

/** 1200×630 card used when a page has no photo of its own. */
export function ShareCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: BACKGROUND,
        color: "#1f1f1f",
        fontFamily: "Cormorant Garamond",
        border: `24px solid ${ACCENT}`,
      }}
    >
      <div style={{ fontSize: 112, color: ACCENT }}>{STORE_NAME}</div>
      <div style={{ marginTop: 12, fontSize: 48 }}>{STORE_TAGLINE}</div>
      <div style={{ marginTop: 36, fontSize: 34, color: "#6b6b6b" }}>Cash on Delivery · Delivered across India</div>
    </div>
  );
}
