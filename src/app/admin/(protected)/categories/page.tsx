import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth";
import { listAdminCategories } from "@/lib/admin/categories";

export const metadata: Metadata = { title: "Categories" };

async function Categories() {
  await requireAdmin();
  const categories = await listAdminCategories();
  return <CategoryManager categories={categories} />;
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-3">
          <Skeleton className="h-10 w-48" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      }
    >
      <Categories />
    </Suspense>
  );
}
