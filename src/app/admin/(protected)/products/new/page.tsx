import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { emptyProductInput, getProductFormData } from "@/lib/admin/products";

export const metadata: Metadata = { title: "Add product" };

async function NewProduct() {
  await requireAdmin();
  const { categories, suggestions } = await getProductFormData();
  return (
    <ProductForm productId={null} initial={emptyProductInput()} categories={categories} suggestions={suggestions} />
  );
}

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="-ml-2 mb-3 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden /> Products
      </Link>
      <h1 className="mb-5 text-3xl md:text-4xl">Add product</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <NewProduct />
      </Suspense>
    </>
  );
}
