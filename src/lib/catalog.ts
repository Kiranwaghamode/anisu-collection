import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma, ProductType } from "@/generated/prisma/client";
import { KURTI_SIZES, SAREE_SIZE } from "@/config/store";
import { db } from "./db";
import { PAGE_SIZE, PRICE_RANGES, type ListingFilters } from "./listing-params";

/**
 * Every storefront read is cached and tagged with CATALOG_TAG.
 * Admin product/category changes (Phase 6) call `updateTag(CATALOG_TAG)`
 * so the storefront updates immediately; otherwise it refreshes every 5 minutes.
 */
export const CATALOG_TAG = "catalog";
const CATALOG_LIFE = { stale: 300, revalidate: 300, expire: 86400 };

// ── Product cards ────────────────────────────────────────────────

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  mrp: true,
  images: true,
  variants: { select: { stock: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp: number | null;
  /** main image plus the optional hover image */
  images: string[];
  soldOut: boolean;
};

function toCard(p: CardRow): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    mrp: p.mrp,
    images: p.images.slice(0, 2),
    soldOut: p.variants.every((v) => v.stock <= 0),
  };
}

// ── Categories ──────────────────────────────────────────────────

export async function getCategories() {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  return db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, type: true, image: true },
  });
}

export async function getCategory(slug: string) {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  return db.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, type: true, image: true },
  });
}

// ── Home page rows ──────────────────────────────────────────────

export async function getNewArrivals(limit = 8) {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getFeatured(limit = 8) {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

// ── Product page ────────────────────────────────────────────────

const sizeRank = (size: string) => {
  const i = (KURTI_SIZES as readonly string[]).indexOf(size);
  return i === -1 ? 99 : i;
};

export async function getProduct(slug: string) {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const product = await db.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { select: { id: true, size: true, stock: true } },
    },
  });
  if (!product) return null;
  // Only sizes that fit the product type (old sizes stay in the DB after a type change, for order history).
  const valid = product.type === "SAREE" ? [SAREE_SIZE] : (KURTI_SIZES as readonly string[]);
  product.variants = product.variants
    .filter((v) => valid.includes(v.size))
    .sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
  return product;
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

export async function getActiveProductSlugs() {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: { isActive: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getRelated(categoryId: string, excludeId: string, limit = 4) {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludeId } },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

// ── Listings, filters and search ────────────────────────────────

/** What a listing page shows before any user filters are applied. */
export type ListingScope = {
  type?: ProductType;
  categorySlug?: string;
  /** search query */
  q?: string;
};

const SEARCH_FIELDS = ["name", "fabric", "color"] as const;

function scopeWhere(scope: ListingScope): Prisma.ProductWhereInput[] {
  const and: Prisma.ProductWhereInput[] = [{ isActive: true }];
  if (scope.type) and.push({ type: scope.type });
  if (scope.categorySlug) and.push({ category: { slug: scope.categorySlug } });

  // Every word must match name, fabric, colour or category, so
  // "red silk" finds red silk sarees but not every red product.
  const words = (scope.q ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 6);
  for (const word of words) {
    and.push({
      OR: [
        ...SEARCH_FIELDS.map((field) => ({ [field]: { contains: word, mode: "insensitive" as const } })),
        { category: { name: { contains: word, mode: "insensitive" } } },
      ],
    });
  }
  return and;
}

function filterWhere(f: ListingFilters): Prisma.ProductWhereInput[] {
  const and: Prisma.ProductWhereInput[] = [];
  if (f.category.length) and.push({ category: { slug: { in: f.category } } });
  if (f.color.length) and.push({ color: { in: f.color } });
  if (f.fabric.length) and.push({ fabric: { in: f.fabric } });
  if (f.occasion.length) and.push({ occasion: { in: f.occasion } });
  // Only match sizes that can actually be bought.
  if (f.size.length) and.push({ variants: { some: { size: { in: f.size }, stock: { gt: 0 } } } });
  const range = PRICE_RANGES.find((r) => r.value === f.price);
  if (range) and.push({ price: { gte: range.min, ...(range.max !== undefined && { lt: range.max }) } });
  return and;
}

const ORDER_BY: Record<ListingFilters["sort"], Prisma.ProductOrderByWithRelationInput[]> = {
  new: [{ createdAt: "desc" }, { id: "asc" }],
  "price-asc": [{ price: "asc" }, { createdAt: "desc" }, { id: "asc" }],
  "price-desc": [{ price: "desc" }, { createdAt: "desc" }, { id: "asc" }],
};

/** Products for a listing page. "Load more" shows pages 1..N together. */
export async function getListing(scope: ListingScope, filters: ListingFilters) {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const where = { AND: [...scopeWhere(scope), ...filterWhere(filters)] };
  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: ORDER_BY[filters.sort],
      take: filters.page * PAGE_SIZE,
      select: cardSelect,
    }),
    db.product.count({ where }),
  ]);
  return { products: rows.map(toCard), total };
}

export type FilterOption = { value: string; label: string };

export type FilterOptions = {
  category: FilterOption[];
  color: FilterOption[];
  fabric: FilterOption[];
  occasion: FilterOption[];
  size: FilterOption[];
};

/** Filter choices that actually exist within a listing's scope. */
export async function getFilterOptions(scope: ListingScope): Promise<FilterOptions> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: { AND: scopeWhere(scope) },
    select: {
      type: true,
      color: true,
      fabric: true,
      occasion: true,
      category: { select: { slug: true, name: true, sortOrder: true } },
    },
  });

  const distinct = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => !!v))]
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));

  const categories = new Map<string, { label: string; sortOrder: number }>();
  for (const r of rows) categories.set(r.category.slug, { label: r.category.name, sortOrder: r.category.sortOrder });

  return {
    category: [...categories.entries()]
      .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
      .map(([value, c]) => ({ value, label: c.label })),
    color: distinct(rows.map((r) => r.color)),
    fabric: distinct(rows.map((r) => r.fabric)),
    occasion: distinct(rows.map((r) => r.occasion)),
    // Sizes only matter when the listing contains kurtis.
    size: rows.some((r) => r.type === "KURTI") ? KURTI_SIZES.map((s) => ({ value: s, label: s })) : [],
  };
}
