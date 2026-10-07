/**
 * Seed: 4 categories + 12 sample products with free Unsplash photos.
 * Safe to re-run: everything is upserted by slug / SKU.
 *
 * Test cases built in:
 *  - "Kanchipuram Silk Saree – Temple Gold" has 0 stock → fully sold out
 *  - "Rose Chikankari Party Kurti" has size M at 0 stock → sold-out size
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductType } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=1500&q=80`;

const KURTI_SIZES = ["S", "M", "L", "XL", "XXL"];
const rs = (rupees: number) => rupees * 100; // paise

const categories = [
  { name: "Silk Sarees", slug: "silk-sarees", type: ProductType.SAREE, sortOrder: 1, image: img("photo-1641699862936-be9f49b1c38d") },
  { name: "Cotton Sarees", slug: "cotton-sarees", type: ProductType.SAREE, sortOrder: 2, image: img("photo-1610189012906-4c0aa9b9781e") },
  { name: "Party Kurtis", slug: "party-kurtis", type: ProductType.KURTI, sortOrder: 3, image: img("photo-1790601118775-41de130c5f95") },
  { name: "Daily Kurtis", slug: "daily-kurtis", type: ProductType.KURTI, sortOrder: 4, image: img("photo-1745313452052-0e4e341f326c") },
];

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  type: ProductType;
  price: number;
  mrp?: number;
  fabric: string;
  color: string;
  occasion: string;
  careInfo: string;
  details: string;
  description: string;
  images: string[];
  isFeatured?: boolean;
  weightGrams?: number;
  /** stock per size; sarees use a single "Free Size" entry */
  stock: Record<string, number>;
};

const sareeDetails = "Saree length: 5.5 m\nBlouse piece: 0.8 m (unstitched)\nWidth: 47 inches";
const kurtiDetails = "Fit: Straight, regular fit\nLength: 44 inches\nSleeves: 3/4 sleeves\nNeck: Round neck";

const products: SeedProduct[] = [
  // ── Silk sarees ──────────────────────────────────────────────
  {
    name: "Kanchipuram Silk Saree – Temple Gold",
    slug: "kanchipuram-silk-saree-temple-gold",
    category: "silk-sarees",
    type: ProductType.SAREE,
    price: rs(8499),
    mrp: rs(10999),
    fabric: "Pure Silk",
    color: "Red",
    occasion: "Wedding",
    careInfo: "Dry clean only",
    details: sareeDetails,
    description:
      "A rich Kanchipuram silk saree in deep red with a woven temple-gold border and pallu. Heavy, lustrous and made for wedding days you'll remember.",
    images: [img("photo-1610030469983-98e550d6193c"), img("photo-1610030469839-f909584b43f1")],
    isFeatured: true,
    weightGrams: 900,
    stock: { "Free Size": 0 },
  },
  {
    name: "Banarasi Silk Saree – Royal Purple",
    slug: "banarasi-silk-saree-royal-purple",
    category: "silk-sarees",
    type: ProductType.SAREE,
    price: rs(6999),
    mrp: rs(8999),
    fabric: "Banarasi Silk",
    color: "Purple",
    occasion: "Wedding",
    careInfo: "Dry clean only",
    details: sareeDetails,
    description:
      "Royal purple Banarasi silk with intricate zari buttis across the body and a grand gold pallu. Pairs beautifully with temple jewellery.",
    images: [img("photo-1641699862936-be9f49b1c38d"), img("photo-1676696706907-0e04665b80bd")],
    isFeatured: true,
    weightGrams: 800,
    stock: { "Free Size": 6 },
  },
  {
    name: "Paithani Silk Saree – Peacock Green",
    slug: "paithani-silk-saree-peacock-green",
    category: "silk-sarees",
    type: ProductType.SAREE,
    price: rs(5499),
    mrp: rs(6499),
    fabric: "Paithani Silk",
    color: "Green",
    occasion: "Festive",
    careInfo: "Dry clean only",
    details: sareeDetails,
    description:
      "A classic Maharashtrian Paithani in peacock green, with a traditional woven border and pallu. Lightweight enough to wear all day.",
    images: [img("photo-1679006831648-7c9ea12e5807"), img("photo-1609748340041-f5d61e061ebc")],
    weightGrams: 750,
    stock: { "Free Size": 4 },
  },
  // ── Cotton sarees ────────────────────────────────────────────
  {
    name: "Handloom Cotton Saree – Indigo Sun",
    slug: "handloom-cotton-saree-indigo-sun",
    category: "cotton-sarees",
    type: ProductType.SAREE,
    price: rs(1899),
    mrp: rs(2499),
    fabric: "Cotton",
    color: "Blue",
    occasion: "Office",
    careInfo: "Gentle hand wash in cold water. Dry in shade.",
    details: sareeDetails,
    description:
      "Soft handloom cotton in indigo blue with a sunny yellow border. Breathable and easy to drape — your everyday office favourite.",
    images: [img("photo-1610189012906-4c0aa9b9781e"), img("photo-1610189013429-a703f4b245cf")],
    weightGrams: 550,
    stock: { "Free Size": 12 },
  },
  {
    name: "Mulmul Cotton Saree – Blush Pink",
    slug: "mulmul-cotton-saree-blush-pink",
    category: "cotton-sarees",
    type: ProductType.SAREE,
    price: rs(1499),
    fabric: "Mulmul Cotton",
    color: "Pink",
    occasion: "Daily",
    careInfo: "Gentle hand wash in cold water. Dry in shade.",
    details: sareeDetails,
    description:
      "Feather-light mulmul cotton in blush pink with a contrast orange border. Made for warm days and easy drapes.",
    images: [img("photo-1617627143750-d86bc21e42bb"), img("photo-1692992193981-d3d92fabd9cb")],
    weightGrams: 450,
    stock: { "Free Size": 9 },
  },
  {
    name: "Bengal Cotton Saree – Ivory Red",
    slug: "bengal-cotton-saree-ivory-red",
    category: "cotton-sarees",
    type: ProductType.SAREE,
    price: rs(2199),
    mrp: rs(2799),
    fabric: "Cotton",
    color: "White",
    occasion: "Festive",
    careInfo: "Dry clean recommended for the first wash.",
    details: sareeDetails,
    description:
      "The timeless Bengal combination: ivory body with a bold red border. Crisp, elegant and perfect for festive mornings.",
    images: [img("photo-1678705730064-a7ecbab4b3fb"), img("photo-1619516388835-2b60acc4049e")],
    isFeatured: true,
    weightGrams: 550,
    stock: { "Free Size": 7 },
  },
  // ── Party kurtis ─────────────────────────────────────────────
  {
    name: "Rose Chikankari Party Kurti",
    slug: "rose-chikankari-party-kurti",
    category: "party-kurtis",
    type: ProductType.KURTI,
    price: rs(1799),
    mrp: rs(2299),
    fabric: "Georgette",
    color: "Pink",
    occasion: "Festive",
    careInfo: "Gentle hand wash. Do not wring.",
    details: kurtiDetails,
    description:
      "Hand-embroidered chikankari on soft georgette in a rose pink shade. Comes with a matching inner lining.",
    images: [img("photo-1741847639057-b51a25d42892"), img("photo-1768033976371-0e4ef195dfa2")],
    isFeatured: true,
    weightGrams: 350,
    stock: { S: 3, M: 0, L: 5, XL: 4, XXL: 2 },
  },
  {
    name: "Scarlet Embroidered Party Kurti",
    slug: "scarlet-embroidered-party-kurti",
    category: "party-kurtis",
    type: ProductType.KURTI,
    price: rs(2199),
    mrp: rs(2799),
    fabric: "Silk Blend",
    color: "Red",
    occasion: "Wedding",
    careInfo: "Dry clean only",
    details: kurtiDetails,
    description:
      "A scarlet silk-blend kurti with rich thread embroidery at the yoke. Dress it up with palazzos or a dupatta for wedding functions.",
    images: [img("photo-1790601118775-41de130c5f95"), img("photo-1708534246055-d7b149acb731")],
    weightGrams: 400,
    stock: { S: 4, M: 6, L: 6, XL: 3, XXL: 2 },
  },
  {
    name: "Midnight Paisley Party Kurti",
    slug: "midnight-paisley-party-kurti",
    category: "party-kurtis",
    type: ProductType.KURTI,
    price: rs(1599),
    fabric: "Rayon",
    color: "Blue",
    occasion: "Festive",
    careInfo: "Hand wash separately in cold water.",
    details: kurtiDetails,
    description:
      "A deep midnight-blue kurti with an all-over paisley print and a flattering A-line flare.",
    images: [img("photo-1760287364219-160c234ded00"), img("photo-1760287363750-1c888c75578f")],
    weightGrams: 300,
    stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
  },
  // ── Daily kurtis ─────────────────────────────────────────────
  {
    name: "White Floral Cotton Kurti",
    slug: "white-floral-cotton-kurti",
    category: "daily-kurtis",
    type: ProductType.KURTI,
    price: rs(999),
    mrp: rs(1299),
    fabric: "Cotton",
    color: "White",
    occasion: "Daily",
    careInfo: "Machine wash cold, gentle cycle.",
    details: kurtiDetails,
    description:
      "A fresh white cotton kurti with delicate floral prints. Soft, breathable and easy to style every day.",
    images: [img("photo-1745313452052-0e4e341f326c"), img("photo-1767785829347-cc13bd969514")],
    weightGrams: 250,
    stock: { S: 8, M: 10, L: 10, XL: 6, XXL: 4 },
  },
  {
    name: "Sunshine Yellow Tiered Kurti",
    slug: "sunshine-yellow-tiered-kurti",
    category: "daily-kurtis",
    type: ProductType.KURTI,
    price: rs(1199),
    fabric: "Cotton",
    color: "Yellow",
    occasion: "Daily",
    careInfo: "Machine wash cold, gentle cycle.",
    details: kurtiDetails,
    description:
      "A cheerful yellow tiered kurti with an embroidered neckline. Light and flowy for summer days.",
    images: [img("photo-1760287363878-1a09af715b80"), img("photo-1764928947261-f5687e0faa4a")],
    weightGrams: 250,
    stock: { S: 6, M: 8, L: 8, XL: 5, XXL: 3 },
  },
  {
    name: "Lavender Printed Office Kurti",
    slug: "lavender-printed-office-kurti",
    category: "daily-kurtis",
    type: ProductType.KURTI,
    price: rs(1099),
    mrp: rs(1399),
    fabric: "Rayon",
    color: "Purple",
    occasion: "Office",
    careInfo: "Hand wash separately in cold water.",
    details: kurtiDetails,
    description:
      "A soft lavender kurti with a subtle print, cut for comfort through long office days.",
    images: [img("photo-1760287363699-a08d553fb8a9"), img("photo-1708534246051-7f47b279e94b")],
    weightGrams: 280,
    stock: { S: 4, M: 7, L: 7, XL: 4, XXL: 2 },
  },
];

function skuFor(slug: string, size: string) {
  const base = slug
    .split("-")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return `${base}-${size.replace(/\s+/g, "").toUpperCase()}`;
}

async function main() {
  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    categoryIds.set(c.slug, row.id);
  }

  // Stagger createdAt so "New Arrivals" has a stable order.
  const now = Date.now();
  for (const [i, p] of products.entries()) {
    const { category, stock, ...fields } = p;
    const data = {
      ...fields,
      mrp: fields.mrp ?? null,
      categoryId: categoryIds.get(category)!,
      createdAt: new Date(now - i * 60 * 60 * 1000),
    };
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });

    const sizes = p.type === ProductType.SAREE ? ["Free Size"] : KURTI_SIZES;
    for (const size of sizes) {
      const sku = skuFor(p.slug, size);
      await db.variant.upsert({
        where: { sku },
        update: { stock: stock[size] ?? 0, size, productId: product.id },
        create: { sku, size, stock: stock[size] ?? 0, productId: product.id },
      });
    }
  }

  const [cats, prods, vars] = await Promise.all([
    db.category.count(),
    db.product.count(),
    db.variant.count(),
  ]);
  console.log(`Seeded: ${cats} categories, ${prods} products, ${vars} variants`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
