import { cacheLife, cacheTag } from "next/cache";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, STORE_NAME, STORE_TAGLINE } from "@/config/store";
import { CATALOG_TAG, getProductsForFeed } from "@/lib/catalog";
import { shareImageUrl } from "@/lib/image-url";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { rupees } from "@/lib/structured-data";

// Google Merchant Center product feed (RSS 2.0). Submit <site>/feed.xml as a
// scheduled fetch in Merchant Center → Products → Feeds.

const xml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

const tag = (name: string, value: string | null | undefined) => (value ? `<g:${name}>${xml(value)}</g:${name}>` : "");

async function buildFeed() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 });
  cacheTag(CATALOG_TAG);
  const products = await getProductsForFeed();

  const items = products
    .filter((p) => p.images.length > 0)
    .map((p) => {
      const onSale = p.mrp !== null && p.mrp > p.price;
      const shipping = p.price >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      return [
        "<item>",
        tag("id", p.id),
        tag("title", p.name),
        tag("description", p.description.replace(/\s+/g, " ").trim().slice(0, 5000)),
        tag("link", absoluteUrl(`/product/${p.slug}`)),
        tag("image_link", shareImageUrl(p.images[0])),
        ...p.images.slice(1, 11).map((src) => tag("additional_image_link", shareImageUrl(src))),
        tag("availability", p.inStock ? "in_stock" : "out_of_stock"),
        tag("price", `${rupees(onSale ? p.mrp! : p.price)} INR`),
        onSale ? tag("sale_price", `${rupees(p.price)} INR`) : "",
        tag("brand", STORE_NAME),
        tag("condition", "new"),
        tag("identifier_exists", "no"),
        tag("google_product_category", "Apparel & Accessories > Clothing"),
        tag("product_type", `${p.type === "SAREE" ? "Sarees" : "Kurtis"} > ${p.category.name}`),
        tag("gender", "female"),
        tag("age_group", "adult"),
        tag("color", p.color),
        tag("material", p.fabric),
        `<g:shipping><g:country>IN</g:country><g:price>${rupees(shipping)} INR</g:price></g:shipping>`,
        "</item>",
      ].join("");
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "<channel>",
    `<title>${xml(STORE_NAME)}</title>`,
    `<link>${xml(SITE_URL)}</link>`,
    `<description>${xml(STORE_TAGLINE)}</description>`,
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");
}

export async function GET() {
  return new Response(await buildFeed(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
