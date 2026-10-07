import Link from "next/link";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFilterOptions, getListing, type FilterOptions, type ListingScope } from "@/lib/catalog";
import {
  LIST_FILTER_KEYS,
  PAGE_SIZE,
  PRICE_RANGES,
  clearFilters,
  listingHref,
  parseListingParams,
  type ListingFilters,
} from "@/lib/listing-params";
import { ListingControls } from "./listing-controls";
import { ProductGrid } from "./product-card";

type SearchParams = Record<string, string | string[] | undefined>;

/** Removable chips for the filters currently applied. Plain links, so they work without JS. */
function ActiveFilters({
  basePath,
  filters,
  options,
  extra,
}: {
  basePath: string;
  filters: ListingFilters;
  options: FilterOptions;
  extra?: Record<string, string | undefined>;
}) {
  const chips: { label: string; href: string }[] = [];
  for (const key of LIST_FILTER_KEYS) {
    for (const value of filters[key]) {
      const label = options[key].find((o) => o.value === value)?.label ?? value;
      chips.push({
        label: key === "size" ? `Size ${label}` : label,
        href: listingHref(basePath, { ...filters, [key]: filters[key].filter((v) => v !== value), page: 1 }, extra),
      });
    }
  }
  if (filters.price) {
    chips.push({
      label: PRICE_RANGES.find((r) => r.value === filters.price)!.label,
      href: listingHref(basePath, { ...filters, price: null, page: 1 }, extra),
    });
  }
  if (!chips.length) return null;

  return (
    <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {chips.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          aria-label={`Remove filter: ${c.label}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface pr-3 pl-4 text-sm"
        >
          {c.label}
          <XIcon className="size-3.5 text-muted-foreground" aria-hidden />
        </Link>
      ))}
      {chips.length > 1 && (
        <Link
          href={listingHref(basePath, clearFilters(filters), extra)}
          className="inline-flex min-h-11 shrink-0 items-center px-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Clear all
        </Link>
      )}
    </div>
  );
}

/**
 * Shared body of /sarees, /kurtis, /category/[slug] and /search.
 * Reads search params, so render it inside <Suspense>.
 */
export async function ProductListing({
  scope,
  basePath,
  searchParams,
  extra,
}: {
  scope: ListingScope;
  basePath: string;
  searchParams: Promise<SearchParams>;
  extra?: Record<string, string | undefined>;
}) {
  const filters = parseListingParams(await searchParams);
  const [{ products, total }, options] = await Promise.all([getListing(scope, filters), getFilterOptions(scope)]);

  // The category filter is pointless inside a single category.
  const visibleOptions = scope.categorySlug ? { ...options, category: [] } : options;

  return (
    <>
      <ListingControls
        basePath={basePath}
        filters={filters}
        options={visibleOptions}
        total={total}
        extra={extra}
      />
      <ActiveFilters basePath={basePath} filters={filters} options={options} extra={extra} />

      {products.length > 0 ? (
        <ProductGrid products={products} eagerFirst />
      ) : (
        <div className="py-16 text-center">
          <p className="font-heading text-2xl">No products found</p>
          <p className="mt-2 text-muted-foreground">Try removing a filter or two.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href={listingHref(basePath, clearFilters(filters), extra)}>Clear filters</Link>
          </Button>
        </div>
      )}

      {products.length < total && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {products.length} of {total}
          </p>
          <Button asChild variant="outline" className="min-w-48">
            <Link href={listingHref(basePath, { ...filters, page: filters.page + 1 }, extra)} scroll={false}>
              Load more
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <Skeleton className="mb-6 hidden h-12 w-full md:block" />
      <Skeleton className="mb-4 h-5 w-24 md:hidden" />
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
        {Array.from({ length: Math.min(count, PAGE_SIZE) }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-4/5 w-full rounded-md" />
            <Skeleton className="mt-3 h-4 w-4/5" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
