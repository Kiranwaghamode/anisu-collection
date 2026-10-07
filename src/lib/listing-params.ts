// URL search params for listing pages (filters, sort, "load more").
// Shared by server pages and client filter sheets, so keep it free of server-only imports.

export const PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/** Price buckets in paise. `max` is exclusive. */
export const PRICE_RANGES = [
  { value: "0-1000", label: "Under ₹1,000", min: 0, max: 100000 },
  { value: "1000-2000", label: "₹1,000 – ₹2,000", min: 100000, max: 200000 },
  { value: "2000-5000", label: "₹2,000 – ₹5,000", min: 200000, max: 500000 },
  { value: "5000-", label: "Above ₹5,000", min: 500000, max: undefined },
] as const;

export type PriceKey = (typeof PRICE_RANGES)[number]["value"];

export type ListingFilters = {
  category: string[];
  color: string[];
  fabric: string[];
  occasion: string[];
  size: string[];
  price: PriceKey | null;
  sort: SortKey;
  page: number;
};

/** Multi-value filters, stored in the URL as comma-separated lists (`?color=Red,Pink`). */
export const LIST_FILTER_KEYS = ["category", "color", "fabric", "occasion", "size"] as const;
export type ListFilterKey = (typeof LIST_FILTER_KEYS)[number];

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function list(v: string | string[] | undefined): string[] {
  const s = first(v);
  if (!s) return [];
  return [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))].slice(0, 20);
}

export function parseListingParams(raw: RawParams): ListingFilters {
  const sort = first(raw.sort);
  const price = first(raw.price);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  return {
    category: list(raw.category),
    color: list(raw.color),
    fabric: list(raw.fabric),
    occasion: list(raw.occasion),
    size: list(raw.size),
    price: PRICE_RANGES.some((r) => r.value === price) ? (price as PriceKey) : null,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortKey) : "new",
    // Cap so a crafted URL can't ask for thousands of rows at once.
    page: Number.isFinite(page) ? Math.min(Math.max(page, 1), 20) : 1,
  };
}

export function activeFilterCount(f: ListingFilters): number {
  return LIST_FILTER_KEYS.reduce((n, k) => n + f[k].length, 0) + (f.price ? 1 : 0);
}

/** Same sort, no filters. */
export function clearFilters(f: ListingFilters): ListingFilters {
  return { ...f, category: [], color: [], fabric: [], occasion: [], size: [], price: null, page: 1 };
}

/**
 * Build a listing URL. Changing filters or sort resets to page 1;
 * `extra` carries params that aren't filters (e.g. the search query `q`).
 */
export function listingHref(
  basePath: string,
  f: ListingFilters,
  extra: Record<string, string | undefined> = {},
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) if (v) sp.set(k, v);
  for (const k of LIST_FILTER_KEYS) if (f[k].length) sp.set(k, f[k].join(","));
  if (f.price) sp.set("price", f.price);
  if (f.sort !== "new") sp.set("sort", f.sort);
  if (f.page > 1) sp.set("page", String(f.page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
