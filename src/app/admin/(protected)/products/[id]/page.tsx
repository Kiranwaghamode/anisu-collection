import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminProduct, getProductFormData, productToInput } from "@/lib/admin/products";

export const metadata: Metadata = { title: "Edit product" };

async function EditProduct({ params }: Pick<PageProps<"/admin/products/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const [product, { categories, suggestions }] = await Promise.all([getAdminProduct(id), getProductFormData()]);
  if (!product) notFound();
  return (
    <>
      <h1 className="mb-5 text-3xl md:text-4xl">{product.name}</h1>
      <ProductForm
        key={product.updatedAt.toISOString()}
        productId={product.id}
        initial={productToInput(product)}
        categories={categories}
        suggestions={suggestions}
      />
    </>
  );
}

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <>
      <Link href="/admin/products" className="-ml-2 mb-3 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden /> Products
      </Link>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <EditProduct params={params} />
      </Suspense>
    </>
  );
}
