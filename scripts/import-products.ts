/**
 * Bulk-adds products from a JSON file, the same way the admin form does:
 * photos go to Cloudinary, each product gets every size of its type with stock 0,
 * and it is saved as Hidden so the owner can check it, set stock and switch it Live.
 * Products whose web address already exists are skipped, so it is safe to re-run.
 *
 *   npx tsx --conditions=react-server scripts/import-products.ts <import.json>
 *
 * JSON: { categories: [{ slug, name, type }], products: [{ name, type, category (slug),
 *   price, mrp, fabric, color, occasion, weightGrams, description, details, photos }] }
 * Prices are in rupees; photo paths are relative to the JSON file.
 * Categories are created if missing, and get the first product's photo as their
 * home page tile when they have none (or still have a placeholder).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { saveProduct } from "../src/lib/admin/products";
import { productFormSchema, slugify } from "../src/lib/admin/product-schema";
import { signUpload } from "../src/lib/cloudinary";
import { db } from "../src/lib/db";

type ImportFile = {
  categories: { slug: string; name: string; type: "SAREE" | "KURTI" }[];
  products: {
    name: string;
    type: "SAREE" | "KURTI";
    category: string;
    price: number;
    mrp?: number | null;
    fabric?: string;
    color?: string;
    occasion?: string;
    weightGrams: number;
    description: string;
    details?: string;
    photos: string[];
  }[];
};

async function upload(file: string): Promise<string> {
  const { uploadUrl, fields } = signUpload("anisu/products");
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  body.append("file", new Blob([fs.readFileSync(file)], { type: "image/jpeg" }), path.basename(file));
  const res = await fetch(uploadUrl, { method: "POST", body });
  const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
  if (!res.ok || !json.secure_url) throw new Error(`upload ${file}: ${json.error?.message ?? res.status}`);
  return json.secure_url;
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: import-products.ts <import.json>");
  const dir = path.dirname(path.resolve(file));
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as ImportFile;

  const categoryIds = new Map<string, string>();
  for (let i = 0; i < data.categories.length; i++) {
    const c = data.categories[i];
    const row =
      (await db.category.findUnique({ where: { slug: c.slug }, select: { id: true } })) ??
      (await db.category.create({ data: { ...c, sortOrder: i }, select: { id: true } }));
    categoryIds.set(c.slug, row.id);
  }

  let added = 0;
  for (const p of data.products) {
    const slug = slugify(p.name);
    if (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
      console.log(`skip (exists)  ${p.name}`);
      continue;
    }
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`${p.name}: unknown category ${p.category}`);

    // Validate everything before uploading, so a typo doesn't leave stray photos in Cloudinary.
    const input = {
      name: p.name,
      slug,
      type: p.type,
      categoryId,
      price: String(p.price),
      mrp: p.mrp ? String(p.mrp) : "",
      fabric: p.fabric ?? "",
      color: p.color ?? "",
      occasion: p.occasion ?? "",
      description: p.description,
      details: p.details ?? "",
      careInfo: "",
      weightGrams: String(p.weightGrams),
      isFeatured: false,
      isActive: false,
      images: ["https://res.cloudinary.com/x/image/upload/check.jpg"],
      stock: {},
    };
    const check = productFormSchema.safeParse(input);
    if (!check.success) throw new Error(`${p.name}: ${check.error.issues.map((i) => i.message).join(", ")}`);

    const images: string[] = [];
    for (const photo of p.photos) images.push(await upload(path.join(dir, photo)));
    await saveProduct(null, productFormSchema.parse({ ...input, images }));

    const category = await db.category.findUnique({ where: { id: categoryId }, select: { image: true } });
    if (!category?.image || category.image.includes("images.unsplash.com")) {
      await db.category.update({ where: { id: categoryId }, data: { image: images[0] } });
    }
    added++;
    console.log(`added (hidden) ${p.name}  ₹${p.price}  ${images.length} photo(s)`);
  }
  console.log(`\n${added} added, ${data.products.length - added} skipped`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
