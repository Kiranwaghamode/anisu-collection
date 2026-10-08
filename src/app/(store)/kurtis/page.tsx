import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/store/page-title";
import { ProductGridSkeleton, ProductListing } from "@/components/store/product-listing";
import { breadcrumbLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Kurtis",
  description: "Shop party and everyday kurtis online in sizes S to XXL. Cash on Delivery available.",
  alternates: { canonical: "/kurtis" },
};

export default function KurtisPage({ searchParams }: PageProps<"/kurtis">) {
  return (
    <div className="container-page pb-16">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Kurtis", path: "/kurtis" },
        ])}
      />
      <PageTitle title="Kurtis" subtitle="Easy everyday cottons and festive favourites, S to XXL." />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing scope={{ type: "KURTI" }} basePath="/kurtis" searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
