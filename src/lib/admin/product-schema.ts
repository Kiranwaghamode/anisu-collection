// Product form validation, shared by the admin form (client) and the save action (server).
import { z } from "zod";
import { KURTI_SIZES, SAREE_SIZE } from "@/config/store";

export const OCCASIONS = ["Daily", "Office", "Festive", "Party", "Wedding"] as const;

export function sizesFor(type: "SAREE" | "KURTI"): string[] {
  return type === "SAREE" ? [SAREE_SIZE] : [...KURTI_SIZES];
}

/** "My Silk Saree – Red!" → "my-silk-saree-red" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Images we serve: Cloudinary uploads, plus the Unsplash placeholders from the seed data. */
export function isAllowedImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "res.cloudinary.com" || u.hostname === "images.unsplash.com");
  } catch {
    return false;
  }
}

const optionalText = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);

/** Rupees typed by a person ("1,499" or "1499.50") → paise. */
const rupees = (label: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[,₹\s]/g, ""))
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), `Enter the ${label} in rupees, e.g. 1499`)
    .transform((v) => Math.round(Number(v) * 100))
    .refine((p) => p >= 100 && p <= 50_000_000, `The ${label} looks wrong`);

export const productFormSchema = z
  .object({
    name: z.string().trim().min(3, "Enter the product name").max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Enter a web address")
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use only lowercase letters, numbers and dashes"),
    type: z.enum(["SAREE", "KURTI"]),
    categoryId: z.string().min(1, "Choose a category"),
    price: rupees("price"),
    mrp: z.union([z.literal(""), rupees("MRP")]).transform((v) => (v === "" ? null : v)),
    fabric: optionalText(60),
    color: optionalText(40),
    occasion: optionalText(40),
    description: z.string().trim().min(10, "Write a short description (at least a sentence)").max(5000),
    details: optionalText(2000),
    careInfo: optionalText(300),
    weightGrams: z
      .string()
      .trim()
      .refine((v) => /^\d+$/.test(v) && Number(v) >= 50 && Number(v) <= 10000, "Enter the weight in grams (50–10000)")
      .transform(Number),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
    images: z
      .array(z.string().refine(isAllowedImageUrl, "Invalid image"))
      .min(1, "Add at least one photo")
      .max(10, "Up to 10 photos"),
    stock: z.record(
      z.string(),
      z
        .string()
        .trim()
        .refine((v) => /^\d+$/.test(v) && Number(v) <= 9999, "Enter a whole number")
        .transform(Number),
    ),
  })
  .refine((v) => v.mrp === null || v.mrp > v.price, {
    message: "MRP should be higher than the price (or leave it empty)",
    path: ["mrp"],
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
