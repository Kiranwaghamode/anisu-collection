import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/store/page-title";
import { ProductGridSkeleton, ProductListing } from "@/components/store/product-listing";
import { breadcrumbLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Sarees",
  description: "Shop silk and cotton sarees online — Banarasi, Kanchipuram, Paithani, handloom and more. Cash on Delivery available.",
  alternates: { canonical: "/sarees" },
};

export default function SareesPage({ searchParams }: PageProps<"/sarees">) {
  return (
    <div className="container-page pb-16">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Sarees", path: "/sarees" },
        ])}
      />
      <PageTitle title="Sarees" subtitle="Silk for the big days, cotton for every day." />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing scope={{ type: "SAREE" }} basePath="/sarees" searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
