import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/store/page-title";
import { ProductGridSkeleton, ProductListing } from "@/components/store/product-listing";
import { getCategories, getCategory } from "@/lib/catalog";
import { shareImageUrl } from "@/lib/image-url";
import { OG_DEFAULTS } from "@/lib/site";
import { breadcrumbLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const description = `Shop ${category.name.toLowerCase()} online. Cash on Delivery and free shipping above ₹999 across India.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      ...OG_DEFAULTS,
      title: category.name,
      description,
      url: `/category/${category.slug}`,
      ...(category.image && { images: [{ url: shareImageUrl(category.image), alt: category.name }] }),
    },
  };
}

async function CategoryContent({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const listing = category.type === "SAREE" ? { name: "Sarees", path: "/sarees" } : { name: "Kurtis", path: "/kurtis" };

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          listing,
          { name: category.name, path: `/category/${category.slug}` },
        ])}
      />
      <PageTitle title={category.name} />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing
          scope={{ type: category.type, categorySlug: category.slug }}
          basePath={`/category/${category.slug}`}
          searchParams={searchParams}
        />
      </Suspense>
    </>
  );
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <div className="container-page pb-16">
      <Suspense
        fallback={
          <>
            <div className="pt-6 pb-5 md:pt-12 md:pb-8">
              <Skeleton className="h-10 w-56 md:h-14" />
            </div>
            <ProductGridSkeleton />
          </>
        }
      >
        <CategoryContent {...props} />
      </Suspense>
    </div>
  );
}
