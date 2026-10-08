import type { MetadataRoute } from "next";
import { INFO_PAGES } from "@/config/pages";
import { getCategories, getProductsForFeed } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProductsForFeed()]);
  const lastChange = products.reduce<Date | undefined>(
    (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
    undefined,
  );

  return [
    { url: absoluteUrl("/"), lastModified: lastChange, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/sarees"), lastModified: lastChange, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/kurtis"), lastModified: lastChange, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: lastChange,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.slice(0, 5),
    })),
    ...INFO_PAGES.map((page) => ({
      url: absoluteUrl(page.path),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
