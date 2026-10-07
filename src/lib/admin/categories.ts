import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAllowedImageUrl } from "./product-schema";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Enter a web address")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use only lowercase letters, numbers and dashes"),
  type: z.enum(["SAREE", "KURTI"]),
  image: z.string().refine((v) => v === "" || isAllowedImageUrl(v), "Invalid image"),
});

export type CategoryInput = z.input<typeof categorySchema>;

export class CategoryError extends Error {}

export async function listAdminCategories() {
  return db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, type: true, image: true, _count: { select: { products: true } } },
  });
}

export async function saveCategory(id: string | null, input: CategoryInput) {
  const data = categorySchema.parse(input);
  const owner = await db.category.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (owner && owner.id !== id) throw new CategoryError("Another category already uses this web address.");

  if (id) {
    // Products must match their category's type, so the type can't change under them.
    const current = await db.category.findUnique({
      where: { id },
      select: { type: true, _count: { select: { products: true } } },
    });
    if (!current) throw new CategoryError("Category not found.");
    if (current.type !== data.type && current._count.products > 0) {
      throw new CategoryError("Move this category's products elsewhere before changing its type.");
    }
    await db.category.update({ where: { id }, data: { ...data, image: data.image || null } });
  } else {
    const last = await db.category.aggregate({ _max: { sortOrder: true } });
    await db.category.create({
      data: { ...data, image: data.image || null, sortOrder: (last._max.sortOrder ?? 0) + 1 },
    });
  }
}

export async function deleteCategory(id: string) {
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new CategoryError(
      `This category has ${count} product${count === 1 ? "" : "s"}. Move or edit them first.`,
    );
  }
  await db.category.delete({ where: { id } });
}

/** Swap a category with its neighbour, renumbering so the order is always 1, 2, 3… */
export async function moveCategory(id: string, dir: -1 | 1) {
  const all = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true } });
  const i = all.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i === -1 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((c, n) => db.category.update({ where: { id: c.id }, data: { sortOrder: n + 1 } })));
}
