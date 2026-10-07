import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppIcon } from "@/components/store/brand-icons";
import { PriceLine, ProductRow } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { SectionHeading } from "@/components/store/section-heading";
import { COD_FEE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/config/store";
import { getActiveProductSlugs, getProduct, getRelated, type ProductDetail } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { absoluteUrl, whatsappUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const description = product.description.replace(/\s+/g, " ").slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: product.images.slice(0, 1),
    },
  };
}

function DetailRows({ product }: { product: ProductDetail }) {
  const rows = [
    ["Fabric", product.fabric],
    ["Colour", product.color],
    ["Occasion", product.occasion],
  ].filter((r): r is [string, string] => !!r[1]);

  // Free-text details are "Label: value" lines, e.g. "Saree length: 5.5 m".
  const extra = (product.details ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return i > 0 ? ([line.slice(0, i).trim(), line.slice(i + 1).trim()] as const) : (["", line] as const);
    });

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      {[...rows, ...extra].map(([label, value], i) => (
        <div key={i} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const askLink = whatsappUrl(`Hi! I'd like to know more about "${product.name}": ${productUrl}`);

  return (
    <>
      <div className="md:container-page md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:pt-8 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="px-4 pt-5 md:sticky md:top-24 md:self-start md:px-0 md:pt-0">
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href={product.type === "SAREE" ? "/sarees" : "/kurtis"} className="hover:text-accent">
              {product.type === "SAREE" ? "Sarees" : "Kurtis"}
            </Link>
            <ChevronRightIcon className="size-3.5" aria-hidden />
            <Link href={`/category/${product.category.slug}`} className="hover:text-accent">
              {product.category.name}
            </Link>
          </nav>

          <h1 className="text-[1.85rem] md:text-[2.6rem]">{product.name}</h1>
          <PriceLine price={product.price} mrp={product.mrp} className="mt-2 text-xl" />
          <p className="mt-0.5 text-sm text-muted-foreground">Inclusive of all taxes</p>

          <ProductPurchase
            product={{
              slug: product.slug,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              image: product.images[0] ?? "",
              type: product.type,
            }}
            variants={product.variants}
          />

          <ul className="mt-6 grid gap-1.5 text-sm">
            {["Cash on Delivery available", `Free shipping above ${formatINR(FREE_SHIPPING_THRESHOLD)}`, "Ships in 1–2 days"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-accent" aria-hidden />
                  {t}
                </li>
              ),
            )}
          </ul>

          <a
            href={askLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            <WhatsAppIcon className="size-5 text-[#25D366]" />
            Ask on WhatsApp
          </a>

          <h2 className="sr-only">Product information</h2>
          <Accordion type="multiple" defaultValue={["description"]} className="mt-6 border-t border-border">
            {[
              {
                value: "description",
                title: "Description",
                body: <p className="whitespace-pre-line">{product.description}</p>,
              },
              { value: "details", title: "Details", body: <DetailRows product={product} /> },
              ...(product.careInfo
                ? [
                    {
                      value: "care",
                      title: "Care",
                      body: <p className="whitespace-pre-line">{product.careInfo}</p>,
                    },
                  ]
                : []),
              {
                value: "shipping",
                title: "Shipping & Returns",
                body: (
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>
                      Free shipping on orders above {formatINR(FREE_SHIPPING_THRESHOLD)}; otherwise{" "}
                      {formatINR(SHIPPING_FEE)}.
                    </li>
                    <li>Cash on Delivery available (+{formatINR(COD_FEE)}).</li>
                    <li>Ships in 1–2 business days.</li>
                    <li>
                      Easy exchange. See our <Link href="/refund-policy">Refund &amp; Exchange policy</Link>.
                    </li>
                  </ul>
                ),
              },
            ].map((s) => (
                <AccordionItem key={s.value} value={s.value} className="border-border">
                  <AccordionTrigger className="min-h-14 items-center py-3 font-sans text-base font-medium hover:no-underline">
                    {s.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[0.95rem] leading-relaxed text-foreground/85">
                    {s.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </div>

      <Suspense>
        <Related categoryId={product.categoryId} productId={product.id} />
      </Suspense>
    </>
  );
}

async function Related({ categoryId, productId }: { categoryId: string; productId: string }) {
  const related = await getRelated(categoryId, productId);
  if (!related.length) return null;
  return (
    <section className="container-page pt-14 md:pt-24">
      <SectionHeading title="You may also like" />
      <ProductRow products={related} />
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="md:container-page md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:pt-8 lg:gap-16">
      <Skeleton className="aspect-4/5 w-full rounded-none md:rounded-md" />
      <div className="px-4 pt-5 md:px-0 md:pt-0">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-4/5" />
        <Skeleton className="mt-3 h-6 w-40" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-14" />
          ))}
        </div>
        <Skeleton className="mt-8 hidden h-14 w-full md:block" />
      </div>
    </div>
  );
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <div className="pb-16">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}
