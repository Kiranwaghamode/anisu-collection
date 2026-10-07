import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { discountPercent, formatINR } from "@/lib/money";
import type { ProductCardData } from "@/lib/catalog";

export const GRID_IMAGE_SIZES = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";

export function PriceLine({
  price,
  mrp,
  className,
}: {
  price: number;
  mrp: number | null;
  className?: string;
}) {
  const off = discountPercent(price, mrp);
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="font-semibold">{formatINR(price)}</span>
      {off > 0 && (
        <>
          <span className="text-[0.85em] text-muted-foreground line-through">
            <span className="sr-only">MRP </span>
            {formatINR(mrp!)}
          </span>
          <span className="text-[0.85em] font-semibold text-accent">{off}% off</span>
        </>
      )}
    </p>
  );
}

export function ProductCard({
  product,
  sizes = GRID_IMAGE_SIZES,
  eager = false,
}: {
  product: ProductCardData;
  sizes?: string;
  /** Only for the first cards visible without scrolling (they may be the LCP). */
  eager?: boolean;
}) {
  const [main, hover] = product.images;

  return (
    <Link href={`/product/${product.slug}`} className="group block outline-none">
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-muted group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
        {main && (
          <Image
            src={main}
            alt={product.name}
            fill
            sizes={sizes}
            loading={eager ? "eager" : undefined}
            fetchPriority={eager ? "high" : undefined}
            className={cn(
              "object-cover transition duration-700 ease-out group-hover:scale-[1.03]",
              product.soldOut && "opacity-70",
            )}
          />
        )}
        {/* Second image fades in on hover. Desktop only, so phones never download it. */}
        {hover && (
          <Image
            src={hover}
            alt=""
            fill
            sizes={sizes}
            className="hidden object-cover opacity-0 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100 md:block"
          />
        )}
        {product.soldOut && (
          <span className="absolute top-2 left-2 rounded-sm bg-surface/95 px-2 py-1 text-[0.7rem] font-semibold tracking-[0.08em] text-foreground uppercase">
            Sold out
          </span>
        )}
      </div>
      <div className="px-0.5 pt-2.5 pb-1">
        <p className="line-clamp-2 text-sm leading-snug text-foreground md:text-[0.95rem]">{product.name}</p>
        <PriceLine price={product.price} mrp={product.mrp} className="mt-1 text-[0.95rem]" />
      </div>
    </Link>
  );
}

export function ProductGrid({ products, eagerFirst = false }: { products: ProductCardData[]; eagerFirst?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-x-2.5 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} eager={eagerFirst && i < 2} />
        </li>
      ))}
    </ul>
  );
}

/** Swipeable row on phones, plain grid on desktop. */
export function ProductRow({ products }: { products: ProductCardData[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
      {products.map((p) => (
        <li key={p.id} className="w-[44%] shrink-0 snap-start md:w-auto">
          <ProductCard product={p} sizes="(max-width: 768px) 45vw, 25vw" />
        </li>
      ))}
    </ul>
  );
}
