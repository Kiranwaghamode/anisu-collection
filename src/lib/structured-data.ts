// schema.org JSON-LD for Google (rendered with <JsonLd>). Money values in paise.
import {
  DISPATCH_DAYS,
  FREE_SHIPPING_THRESHOLD,
  RETURN_WINDOW_DAYS,
  SHIPPING_FEE,
  STORE_EMAIL,
  STORE_INSTAGRAM,
  STORE_NAME,
  STORE_PHONE,
  TRANSIT_DAYS,
} from "@/config/store";
import { absoluteUrl, SITE_URL } from "./site";

/** ₹3,499 → "3499.00" */
export const rupees = (paise: number) => (paise / 100).toFixed(2);

/** "Peacock Paithani Silk Saree, green, silk": what the photo shows, for alt text and Google Images. */
export function productImageAlt(p: { name: string; color?: string | null; fabric?: string | null }) {
  const extra = [p.color, p.fabric].filter((v) => v && !p.name.toLowerCase().includes(v.toLowerCase()));
  return [p.name, ...extra].join(", ");
}

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": ORG_ID,
    name: STORE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon"),
    email: STORE_EMAIL,
    telephone: STORE_PHONE.replace(/\s/g, ""),
    sameAs: [STORE_INSTAGRAM],
    hasMerchantReturnPolicy: returnPolicy(),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: STORE_NAME,
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: RETURN_WINDOW_DAYS,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
    merchantReturnLink: absoluteUrl("/refund-policy"),
  };
}

function shippingDetails(price: number) {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: rupees(price >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE),
      currency: "INR",
    },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: DISPATCH_DAYS.min, maxValue: DISPATCH_DAYS.max, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: TRANSIT_DAYS.min, maxValue: TRANSIT_DAYS.max, unitCode: "DAY" },
    },
  };
}

export function productLd(p: {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  color: string | null;
  fabric: string | null;
  category: { name: string };
  inStock: boolean;
}) {
  const url = absoluteUrl(`/product/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description.replace(/\s+/g, " ").trim(),
    image: p.images,
    sku: p.id,
    url,
    brand: { "@type": "Brand", name: STORE_NAME },
    category: p.category.name,
    ...(p.color && { color: p.color }),
    ...(p.fabric && { material: p.fabric }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: rupees(p.price),
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      shippingDetails: shippingDetails(p.price),
      hasMerchantReturnPolicy: returnPolicy(),
    },
  };
}
