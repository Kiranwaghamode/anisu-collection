import "server-only";
import { db } from "@/lib/db";
import { sizesFor, type ProductFormInput, type ProductFormOutput } from "./product-schema";

export async function listAdminProducts(q?: string) {
  const term = q?.trim();
  const rows = await db.product.findMany({
    where: term ? { name: { contains: term, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      isActive: true,
      isFeatured: true,
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
  });
  return rows.map((p) => ({ ...p, totalStock: p.variants.reduce((n, v) => n + v.stock, 0) }));
}

export async function getAdminProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { variants: { select: { size: true, stock: true } } },
  });
}

export async function getProductFormData() {
  const [categories, attrs] = await Promise.all([
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, type: true } }),
    db.product.findMany({ select: { fabric: true, color: true, occasion: true } }),
  ]);
  const distinct = (vals: (string | null)[]) =>
    [...new Set(vals.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
  return {
    categories,
    // Suggest values already in use, so filters stay tidy ("Red", not "red" and "RED").
    suggestions: {
      fabric: distinct(attrs.map((a) => a.fabric)),
      color: distinct(attrs.map((a) => a.color)),
      occasion: distinct(attrs.map((a) => a.occasion)),
    },
  };
}

export class ProductSaveError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

function skuFor(slug: string, productId: string, size: string) {
  const initials = slug
    .split("-")
    .map((w) => w[0])
    .join("")
    .slice(0, 6)
    .toUpperCase();
  // The id suffix keeps SKUs unique even when two names share initials.
  return `${initials}-${productId.slice(-4).toUpperCase()}-${size.replace(/\s+/g, "").toUpperCase()}`;
}

/** Create (id = null) or update a product and its size variants. Returns the product id. */
export async function saveProduct(id: string | null, data: ProductFormOutput): Promise<{ id: string; slug: string }> {
  const [slugOwner, category] = await Promise.all([
    db.product.findUnique({ where: { slug: data.slug }, select: { id: true } }),
    db.category.findUnique({ where: { id: data.categoryId }, select: { type: true } }),
  ]);
  if (slugOwner && slugOwner.id !== id) {
    throw new ProductSaveError("Another product already uses this web address.", "slug");
  }
  if (!category) throw new ProductSaveError("Choose a category.", "categoryId");
  if (category.type !== data.type) {
    throw new ProductSaveError(
      `This category is for ${category.type === "SAREE" ? "sarees" : "kurtis"}.`,
      "categoryId",
    );
  }

  const { stock, ...fields } = data;
  const productData = {
    ...fields,
    fabric: fields.fabric || null,
    color: fields.color || null,
    occasion: fields.occasion || null,
    details: fields.details || null,
    careInfo: fields.careInfo || null,
  };
  const sizes = sizesFor(data.type);

  return db.$transaction(
    async (tx) => {
      const product = id
        ? await tx.product.update({ where: { id }, data: productData, select: { id: true, slug: true } })
        : await tx.product.create({ data: productData, select: { id: true, slug: true } });

      const existing = await tx.variant.findMany({
        where: { productId: product.id },
        select: { id: true, size: true, _count: { select: { orderItems: true } } },
      });

      for (const size of sizes) {
        const qty = stock[size] ?? 0;
        const v = existing.find((e) => e.size === size);
        if (v) await tx.variant.update({ where: { id: v.id }, data: { stock: qty } });
        else {
          await tx.variant.create({
            data: { productId: product.id, size, stock: qty, sku: skuFor(product.slug, product.id, size) },
          });
        }
      }

      // Sizes that no longer apply (the type changed). Variants that appear in past
      // orders must stay for order history, so those are just emptied.
      for (const v of existing.filter((e) => !sizes.includes(e.size))) {
        if (v._count.orderItems > 0) await tx.variant.update({ where: { id: v.id }, data: { stock: 0 } });
        else await tx.variant.delete({ where: { id: v.id } });
      }

      return product;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function setProductActive(id: string, isActive: boolean) {
  await db.product.update({ where: { id }, data: { isActive } });
}

const toRupees = (paise: number) => (paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2));

const ALL_SIZES = [...sizesFor("SAREE"), ...sizesFor("KURTI")];

/** Every size gets a stock field, so switching type in the form keeps values valid. */
function stockFields(variants: { size: string; stock: number }[] = []) {
  return Object.fromEntries(ALL_SIZES.map((s) => [s, String(variants.find((v) => v.size === s)?.stock ?? 0)]));
}

export function emptyProductInput(type: "SAREE" | "KURTI" = "SAREE"): ProductFormInput {
  return {
    name: "",
    slug: "",
    type,
    categoryId: "",
    price: "",
    mrp: "",
    fabric: "",
    color: "",
    occasion: "",
    description: "",
    details: "",
    careInfo: "",
    weightGrams: type === "SAREE" ? "700" : "300",
    isFeatured: false,
    isActive: true,
    images: [],
    stock: stockFields(),
  };
}

export function productToInput(p: NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>): ProductFormInput {
  return {
    name: p.name,
    slug: p.slug,
    type: p.type,
    categoryId: p.categoryId,
    price: toRupees(p.price),
    mrp: p.mrp ? toRupees(p.mrp) : "",
    fabric: p.fabric ?? "",
    color: p.color ?? "",
    occasion: p.occasion ?? "",
    description: p.description,
    details: p.details ?? "",
    careInfo: p.careInfo ?? "",
    weightGrams: String(p.weightGrams),
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    images: p.images,
    stock: stockFields(p.variants),
  };
}
