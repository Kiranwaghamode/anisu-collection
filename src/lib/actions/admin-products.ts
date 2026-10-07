"use server";

import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { productFormSchema, type ProductFormInput } from "@/lib/admin/product-schema";
import { ProductSaveError, saveProduct, setProductActive } from "@/lib/admin/products";

export type SaveProductResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; field?: keyof ProductFormInput };

export async function saveProductAction(id: string | null, values: ProductFormInput): Promise<SaveProductResult> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0] as keyof ProductFormInput };
  }
  try {
    const saved = await saveProduct(id, parsed.data);
    updateTag(CATALOG_TAG); // storefront shows the change on the next visit
    return { ok: true, ...saved };
  } catch (err) {
    if (err instanceof ProductSaveError) {
      return { ok: false, error: err.message, field: err.field as keyof ProductFormInput };
    }
    console.error("product save failed", err);
    return { ok: false, error: "Couldn't save the product. Please try again." };
  }
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (typeof id !== "string" || typeof isActive !== "boolean") return { ok: false };
  await setProductActive(id, isActive);
  updateTag(CATALOG_TAG);
  refresh();
  return { ok: true };
}
