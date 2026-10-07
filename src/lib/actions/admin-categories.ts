"use server";

import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  CategoryError,
  categorySchema,
  deleteCategory,
  moveCategory,
  saveCategory,
  type CategoryInput,
} from "@/lib/admin/categories";

export type CategoryResult = { ok: true } | { ok: false; error: string };

async function run(fn: () => Promise<void>): Promise<CategoryResult> {
  try {
    await fn();
    updateTag(CATALOG_TAG); // category tiles, names and filters on the storefront
    refresh();
    return { ok: true };
  } catch (err) {
    if (err instanceof CategoryError) return { ok: false, error: err.message };
    console.error("category change failed", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function saveCategoryAction(id: string | null, input: CategoryInput): Promise<CategoryResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  return run(() => saveCategory(id, input));
}

export async function deleteCategoryAction(id: string): Promise<CategoryResult> {
  await requireAdmin();
  return run(() => deleteCategory(String(id)));
}

export async function moveCategoryAction(id: string, dir: -1 | 1): Promise<CategoryResult> {
  await requireAdmin();
  if (dir !== -1 && dir !== 1) return { ok: false, error: "Invalid request." };
  return run(() => moveCategory(String(id), dir));
}
