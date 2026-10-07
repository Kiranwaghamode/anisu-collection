import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { requireAdmin } from "@/lib/auth";
import { listAdminProducts } from "@/lib/admin/products";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = { title: "Products" };

async function Products({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 60) || undefined;
  const products = await listAdminProducts(q);

  return (
    <>
      <Form action="/admin/products" className="relative mt-4 max-w-md">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name"
          aria-label="Search products"
          className="h-12 w-full rounded-md border border-border bg-surface pr-3 pl-10 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </Form>

      <p className="mt-4 text-sm text-muted-foreground">
        {products.length} {products.length === 1 ? "product" : "products"}
        {q && ` matching “${q}”`}
      </p>

      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-surface">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 p-3 md:gap-4 md:px-4">
            <Link href={`/admin/products/${p.id}`} className="relative aspect-4/5 w-14 shrink-0 overflow-hidden rounded-sm bg-muted md:w-16">
              {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/products/${p.id}`} className="line-clamp-2 font-medium underline-offset-4 hover:underline">
                {p.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {p.category.name}
                {p.isFeatured && " · Featured"}
              </p>
              <p className="mt-0.5 text-sm">
                <span className="font-semibold">{formatINR(p.price)}</span>
                <span className={cn("ml-2", p.totalStock === 0 ? "font-medium text-destructive" : "text-muted-foreground")}>
                  {p.totalStock === 0 ? "Sold out" : `${p.totalStock} in stock`}
                </span>
              </p>
            </div>
            <ActiveToggle id={p.id} active={p.isActive} name={p.name} />
          </li>
        ))}
        {products.length === 0 && <li className="p-8 text-center text-muted-foreground">No products found.</li>}
      </ul>
    </>
  );
}

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusIcon aria-hidden /> Add product
          </Link>
        </Button>
      </div>
      <Suspense
        fallback={
          <div className="mt-4 grid gap-3">
            <Skeleton className="h-12 max-w-md" />
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        }
      >
        <Products searchParams={searchParams} />
      </Suspense>
    </>
  );
}
