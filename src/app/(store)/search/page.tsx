import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBox } from "@/components/store/search-box";
import { PageTitle } from "@/components/store/page-title";
import { ProductGridSkeleton, ProductListing } from "@/components/store/product-listing";

export const metadata: Metadata = {
  title: "Search",
  description: "Search sarees and kurtis by name, fabric, colour or category.",
  robots: { index: false, follow: true },
};

async function SearchContent({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) || undefined;
  const title = q ? `Results for “${q}”` : sp.sort === "new" ? "New Arrivals" : "All products";

  return (
    <>
      <div className="pt-6 md:pt-12">
        <SearchBox defaultValue={q} autoFocus={!q && sp.sort !== "new"} />
      </div>
      <PageTitle title={title} />
      <ProductListing scope={{ q }} basePath="/search" searchParams={searchParams} extra={{ q }} />
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container-page pb-16">
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
