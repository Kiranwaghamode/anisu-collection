import Image from "next/image";
import Link from "next/link";
import { BanknoteIcon, RefreshCwIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid, ProductRow } from "@/components/store/product-card";
import { Reveal } from "@/components/store/reveal";
import { SectionHeading } from "@/components/store/section-heading";
import { FREE_SHIPPING_THRESHOLD, STORE_NAME } from "@/config/store";
import { getCategories, getFeatured, getNewArrivals } from "@/lib/catalog";
import { formatINR } from "@/lib/money";

// TODO(owner): replace these placeholder photos with your own.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=80";
const STORY_IMAGE =
  "https://images.unsplash.com/photo-1609748340041-f5d61e061ebc?auto=format&fit=crop&w=1200&h=1500&q=80";

const TRUST = [
  { icon: BanknoteIcon, label: "Cash on Delivery" },
  { icon: TruckIcon, label: `Free shipping above ${formatINR(FREE_SHIPPING_THRESHOLD)}` },
  { icon: RefreshCwIcon, label: "Easy exchange" },
  { icon: ShieldCheckIcon, label: "Secure payments" },
];

export default async function Home() {
  const [categories, newArrivals, featured] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
    getFeatured(8),
  ]);

  return (
    <>
      {/* 1. Hero */}
      <section className="relative isolate flex min-h-[78dvh] items-end overflow-hidden md:min-h-[82dvh] md:items-center">
        <Image
          src={HERO_IMAGE}
          alt="Woman wearing a red silk saree with a gold border"
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover object-[50%_25%]"
        />
        <div className="absolute inset-0 -z-10 bg-black/35 md:bg-black/25" aria-hidden />
        <div className="container-page animate-in pb-12 text-white duration-700 fade-in slide-in-from-bottom-2 md:pb-0">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] uppercase opacity-90">{STORE_NAME}</p>
          <h1 className="mt-3 max-w-xl text-[2.25rem] text-white md:text-7xl">Draped in timeless elegance</h1>
          <p className="mt-3 max-w-md text-[1.05rem] text-white/90 md:text-lg">
            Handpicked silk and cotton sarees and kurtis, delivered across India.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:flex">
            <Button asChild className="bg-white text-foreground hover:bg-white/90">
              <Link href="/sarees">Shop Sarees</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/kurtis">Shop Kurtis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Category tiles */}
      <section className="container-page pt-12 md:pt-20">
        <Reveal>
          <SectionHeading eyebrow="Explore" title="Shop by category" />
          <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="group block">
                  <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-muted">
                    {c.image && (
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    )}
                  </span>
                  <span className="mt-2.5 flex min-h-11 items-center justify-center font-heading text-xl font-medium md:text-2xl">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 3. New arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-page pt-14 md:pt-24">
          <Reveal>
            <SectionHeading eyebrow="Just in" title="New arrivals" href="/search?sort=new" />
            <ProductRow products={newArrivals} />
          </Reveal>
        </section>
      )}

      {/* 4. Featured (hidden when nothing is featured) */}
      {featured.length > 0 && (
        <section className="container-page pt-14 md:pt-24">
          <Reveal>
            <SectionHeading eyebrow="Our picks" title="Featured" />
            <ProductGrid products={featured} />
          </Reveal>
        </section>
      )}

      {/* 5. Brand story */}
      <section className="container-page pt-14 md:pt-24">
        <Reveal className="grid items-center gap-6 md:grid-cols-2 md:gap-16">
          <div className="relative -mx-4 aspect-4/5 overflow-hidden bg-muted md:mx-0 md:rounded-md">
            <Image src={STORY_IMAGE} alt="Folded silk sarees in rich colours" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="md:max-w-md">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-accent uppercase">Our story</p>
            <h2 className="mt-2 text-[1.6rem] md:text-4xl">Woven with care, chosen with love</h2>
            <p className="mt-4 text-muted-foreground">
              {STORE_NAME} began with a simple idea: beautiful sarees and kurtis, picked one by one from trusted weavers
              and makers. Every piece is checked by hand before it reaches you, so you can shop with confidence.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/about">Read our story</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* 6. Trust strip */}
      <section className="container-page py-14 md:py-24">
        <ul className="grid grid-cols-2 gap-y-8 border-y border-border py-8 md:grid-cols-4 md:py-10">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2.5 px-2 text-center">
              <Icon className="size-6 text-accent" strokeWidth={1.5} aria-hidden />
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
