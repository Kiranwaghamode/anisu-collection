"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, SlidersHorizontalIcon, ArrowUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FilterOptions } from "@/lib/catalog";
import {
  PRICE_RANGES,
  SORT_OPTIONS,
  activeFilterCount,
  clearFilters,
  listingHref,
  type ListFilterKey,
  type ListingFilters,
} from "@/lib/listing-params";
import { BottomBar, useSheetSide } from "./bottom-bar";

const GROUP_LABELS: Record<ListFilterKey, string> = {
  category: "Category",
  size: "Size",
  color: "Colour",
  fabric: "Fabric",
  occasion: "Occasion",
};

const GROUP_ORDER: ListFilterKey[] = ["category", "size", "color", "fabric", "occasion"];

type Props = {
  basePath: string;
  filters: ListingFilters;
  options: FilterOptions;
  total: number;
  /** non-filter params to keep, e.g. the search query */
  extra?: Record<string, string | undefined>;
};

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
        selected
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-surface text-foreground hover:border-foreground/40",
      )}
    >
      {selected && <CheckIcon className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}

export function ListingControls({ basePath, filters, options, total, extra }: Props) {
  const router = useRouter();
  const side = useSheetSide();
  const [open, setOpen] = useState<"filter" | "sort" | null>(null);
  const [draft, setDraft] = useState(filters);

  const count = activeFilterCount(filters);
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)!.label;
  const groups = GROUP_ORDER.filter((k) => options[k].length > 0);

  function go(next: ListingFilters) {
    setOpen(null);
    router.push(listingHref(basePath, { ...next, page: 1 }, extra));
  }

  function openFilters() {
    setDraft(filters);
    setOpen("filter");
  }

  function toggle(key: ListFilterKey, value: string) {
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));
  }

  const sheetClass =
    side === "bottom" ? "max-h-[88dvh] gap-0 rounded-t-2xl" : "w-full gap-0 sm:max-w-md";

  const filterLabel = (
    <>
      <SlidersHorizontalIcon aria-hidden />
      Filter
      {count > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[0.7rem] text-accent-foreground">
          {count}
        </span>
      )}
    </>
  );

  return (
    <>
      {/* Desktop toolbar */}
      <div className="mb-6 hidden items-center justify-between border-y border-border py-2 md:flex">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={openFilters}>
            {filterLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen("sort")}>
            <ArrowUpDownIcon aria-hidden />
            Sort: {sortLabel}
          </Button>
        </div>
      </div>

      {/* Phone: count above the grid, actions in thumb reach */}
      <p className="mb-4 text-sm text-muted-foreground md:hidden">
        {total} {total === 1 ? "product" : "products"}
      </p>
      <BottomBar className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="border-border text-foreground" onClick={openFilters}>
          {filterLabel}
        </Button>
        <Button variant="outline" className="border-border text-foreground" onClick={() => setOpen("sort")}>
          <ArrowUpDownIcon aria-hidden />
          Sort
        </Button>
      </BottomBar>

      {/* Filter sheet */}
      <Sheet open={open === "filter"} onOpenChange={(o) => setOpen(o ? "filter" : null)}>
        <SheetContent side={side} className={sheetClass}>
          {side === "bottom" && <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border" aria-hidden />}
          <SheetHeader className="border-b border-border px-5 pt-3 pb-3 md:pt-5">
            <SheetTitle className="text-2xl font-semibold">Filter</SheetTitle>
            <SheetDescription className="sr-only">Narrow down the products shown</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-2">
            {groups.map((key) => (
              <fieldset key={key} className="border-b border-border py-4 last:border-0">
                <legend className="float-left mb-3 w-full text-xs font-semibold tracking-[0.14em] uppercase">{GROUP_LABELS[key]}</legend>
                <div className="clear-both flex flex-wrap gap-2">
                  {options[key].map((o) => (
                    <Chip key={o.value} selected={draft[key].includes(o.value)} onClick={() => toggle(key, o.value)}>
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            ))}
            <fieldset className="py-4">
              <legend className="float-left mb-3 w-full text-xs font-semibold tracking-[0.14em] uppercase">Price</legend>
              <div className="clear-both flex flex-wrap gap-2">
                {PRICE_RANGES.map((r) => (
                  <Chip
                    key={r.value}
                    selected={draft.price === r.value}
                    onClick={() => setDraft((d) => ({ ...d, price: d.price === r.value ? null : r.value }))}
                  >
                    {r.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          <SheetFooter className="grid grid-cols-2 gap-3 border-t border-border px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <Button
              variant="outline"
              className="border-border text-foreground"
              onClick={() => go(clearFilters(filters))}
            >
              Clear all
            </Button>
            <Button onClick={() => go(draft)}>Show results</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sort sheet */}
      <Sheet open={open === "sort"} onOpenChange={(o) => setOpen(o ? "sort" : null)}>
        <SheetContent side={side} className={cn(sheetClass, "pb-safe")}>
          {side === "bottom" && <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border" aria-hidden />}
          <SheetHeader className="px-5 pt-3 pb-2 md:pt-5">
            <SheetTitle className="text-2xl font-semibold">Sort by</SheetTitle>
            <SheetDescription className="sr-only">Choose the order of products</SheetDescription>
          </SheetHeader>
          <ul className="px-5 pb-4">
            {SORT_OPTIONS.map((o) => {
              const selected = o.value === filters.sort;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => go({ ...filters, sort: o.value })}
                    className={cn(
                      "flex min-h-13 w-full items-center justify-between border-b border-border text-left text-base",
                      selected && "font-semibold text-accent",
                    )}
                  >
                    {o.label}
                    {selected && <CheckIcon className="size-5" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
