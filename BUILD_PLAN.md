# Build Plan — Saree & Kurti E-commerce Website

> **For Claude Code:** This is the complete spec. Build it **one phase at a time**. At the end of each phase, run the app, check every item in that phase's "Done when" list, then **stop and wait for the owner's review** before starting the next phase.
> **Do NOT add features that are not in this document** (no wishlist, reviews, coupons, blog, customer accounts, multi-language, etc.). If something seems missing, ask instead of adding it.

---

## 0. Project Overview

A minimal, attractive online store that sells **sarees and kurtis** in India.
Visitors browse products → add to cart → check out with **Cash on Delivery** or **online payment (Razorpay)** → the owner gets an instant alert → the owner ships via **Shiprocket** → the customer receives the order.

### Core rules
- **Guest checkout only.** No customer sign-up or login. The customer enters name, phone, email and address at checkout.
- **One admin** (the owner), who logs in with a password from an env variable.
- **MOBILE FIRST, ALWAYS.** About 90% of visitors will be on phones. Design and build every screen **for a 390px phone first**, then adapt it for desktop. The site must look **brilliant and very attractive on mobile**, like a premium fashion app, not a shrunken desktop site. Desktop only needs to look clean and work properly. See **Section 1A**, which applies to every phase.
- **SEO first.** All storefront pages are server-rendered.
- **All money is stored as integers in paise** (₹1 = 100 paise). Never use floats for money.
- **Prices shown to customers include GST.**

### Tech stack
| Purpose | Tool |
|---|---|
| Framework | Next.js (latest stable, App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion (`motion` package). Subtle only: fades and slight slides. |
| Database | PostgreSQL (Neon or Supabase) |
| ORM | Prisma |
| Validation | Zod (all forms and API inputs) |
| Cart state | Zustand with localStorage persistence |
| Images | Cloudinary (upload from admin, served through `next/image`) |
| Payments | Razorpay |
| Shipping | Shiprocket API |
| Owner alerts | Telegram Bot API |
| Emails | Resend + React Email |
| Admin auth | Password in env → signed HTTP-only cookie (`jose`) |
| Hosting | Vercel |

---

## 1. Design System

Minimal and premium. **The product photos are the design.**

### Colours (define as CSS variables / Tailwind theme tokens)
| Token | Value | Use |
|---|---|---|
| `background` | `#FAF7F2` | Page background (warm off-white) |
| `surface` | `#FFFFFF` | Cards, inputs |
| `foreground` | `#1F1F1F` | Main text |
| `muted` | `#6B6B6B` | Secondary text |
| `border` | `#E8E2D9` | Lines, dividers |
| `accent` | `#7A1E2C` | Buttons, links, highlights (maroon). Keep it in one token so it's easy to change. |

Rule: about 90% neutral, 10% accent. No gradients, no flashing banners, no countdown timers, no popups.

### Typography
- Headings: **Cormorant Garamond** (serif), via `next/font/google`
- Body, prices and UI: **Inter** (sans-serif)
- Only these two fonts.

### Layout rules
- Generous white space. Max content width about 1280px. Side padding 16px on mobile.
- Product images use a **4:5 portrait** aspect ratio everywhere.
- Buttons: solid accent for primary, outlined for secondary, slightly rounded (`rounded-md`).
- Hover on product cards: a slow zoom on the image (scale 1.03) and the second image fades in if one exists.
- Page and section entrance: fade plus 8px slide-up, about 0.4s, once only.
- Must look good at 360px width. No horizontal scrolling.

---

## 1A. Mobile-First Requirements (applies to EVERY phase)

> **Top priority.** If a choice is good for desktop but worse for mobile, choose mobile.

### How to build
- Write Tailwind classes **mobile first**: base classes are for phones, and `md:` / `lg:` are only for larger screens. Never design desktop first and "fix" mobile afterwards.
- Primary test widths: **360px, 390px, 414px**. Desktop (1280px) is secondary.
- Check every page in Chrome DevTools mobile emulation **and** on a real Android phone before calling a phase done.

### Look and feel (it should feel like a premium fashion app)
- **Big, edge-to-edge product images** on mobile. Product page images are full width with no side padding.
- Product grid: **2 columns** on mobile with small gaps (8–12px), so images stay large and the page feels rich.
- Headings in serif, sized for mobile first (for example hero 32–36px, section titles 24px). Body text at least **16px** (this also stops iOS zooming into inputs).
- Smooth, subtle motion: fade-ins, gentle image transitions, bottom sheets that slide up. Keep it at 60fps, and respect `prefers-reduced-motion`.
- Horizontal **swipeable rows** (scroll-snap) on the home page for categories and new arrivals, a natural mobile pattern.

### Thumb-friendly interaction
- All tap targets at least **44×44px**, with enough spacing between them.
- **Main actions within thumb reach (bottom of screen):**
  - Product page: **sticky bottom bar** with price + "Add to Cart" + "Buy Now", always visible while scrolling
  - Cart drawer and checkout: **sticky bottom "Checkout" / "Place Order" button** showing the total
  - Listing pages: sticky bottom **"Filter" and "Sort" buttons**, each opening a bottom sheet
- Use **bottom sheets** (shadcn Sheet with `side="bottom"`) for filters, sort, size selection and menus, not small dropdowns.
- **Nothing may depend on hover.** Hover effects are a desktop-only bonus.
- Image gallery: **swipe** left and right with dot indicators, plus **pinch-zoom or tap-to-zoom** fullscreen.
- Floating WhatsApp button must not cover the sticky bottom bars. Place it above them, or hide it on pages that have a sticky bar.

### Mobile forms (checkout)
- Correct keyboards: phone `type="tel" inputMode="numeric"`, pincode `inputMode="numeric"`, email `type="email"`.
- Proper `autocomplete` attributes (`name`, `tel`, `email`, `address-line1`, `postal-code`, and so on) so the phone autofills details.
- One column, large inputs (at least 48px tall), labels above inputs, and errors shown right under the field.
- No zooming into inputs, and the keyboard must not hide the "Place Order" button.

### Mobile technical
- `viewport` meta set correctly, and support for **safe-area insets** (`env(safe-area-inset-bottom)`) so sticky bars aren't hidden behind the iPhone home bar or Android gesture bar.
- Use `100dvh` (not `100vh`) for full-height sections.
- **Fast on a mid-range Android over 4G:** tiny JS bundles on storefront pages, Cloudinary images sized for mobile (`sizes="(max-width: 768px) 50vw, 25vw"`, etc.), lazy loading below the fold, and a priority-loaded hero/first product image.
- Target **Lighthouse mobile** scores of 90+ for Performance, Accessibility, Best Practices and SEO.
- Admin panel must also be fully usable on a phone, since the owner will manage orders and add products from a mobile (camera upload for product photos).

---

## 2. Data Model (Prisma)

```prisma
enum ProductType { SAREE KURTI }
enum PaymentMethod { COD PREPAID }
enum OrderStatus {
  PENDING_PAYMENT   // prepaid order created, payment not finished
  PLACED            // COD placed, or prepaid paid → waiting for owner
  CONFIRMED         // owner confirmed (for COD: after calling the customer)
  SHIPPED           // AWB created, handed to courier
  DELIVERED
  CANCELLED
  RTO               // returned to origin (undelivered)
}
enum PaymentStatus { PENDING PAID FAILED REFUNDED }

model Category {
  id        String    @id @default(cuid())
  name      String                     // "Silk Sarees"
  slug      String    @unique          // "silk-sarees"
  type      ProductType
  image     String?                    // Cloudinary URL for the homepage tile
  sortOrder Int       @default(0)
  products  Product[]
}

model Product {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String    @db.Text      // plain text or simple markdown
  type        ProductType
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  price       Int                      // paise, selling price
  mrp         Int?                     // paise, shown struck-through if > price
  fabric      String?
  color       String?
  occasion    String?                  // "Wedding", "Office", "Festive", "Daily"
  careInfo    String?                  // "Dry clean only"
  details     String?   @db.Text      // saree length, blouse piece, kurti fit, etc.
  images      String[]                 // Cloudinary URLs, first = main image
  weightGrams Int       @default(500)  // for shipping
  isActive    Boolean   @default(true)
  isFeatured  Boolean   @default(false)
  variants    Variant[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Sarees have ONE variant with size "Free Size". Kurtis have one per size.
model Variant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  size      String                     // "Free Size", "S", "M", "L", "XL", "XXL"
  stock     Int     @default(0)
  sku       String  @unique
  orderItems OrderItem[]
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique   // human readable, e.g. "SR1045"
  customerName    String
  phone           String                  // 10-digit Indian mobile
  email           String
  addressLine1    String
  addressLine2    String?
  city            String
  state           String
  pincode         String                  // 6 digits
  items           OrderItem[]
  subtotal        Int                     // paise
  shippingFee     Int                     // paise
  codFee          Int                     // paise (0 for prepaid)
  total           Int                     // paise
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  status          OrderStatus
  razorpayOrderId   String?     @unique
  razorpayPaymentId String?
  shiprocketOrderId    String?
  shiprocketShipmentId String?
  awbCode         String?
  courierName     String?
  trackingUrl     String?
  adminNote       String?       @db.Text
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId   String
  variant     Variant @relation(fields: [variantId], references: [id])
  productName String          // snapshot at time of order
  size        String          // snapshot
  image       String          // snapshot
  unitPrice   Int             // paise, snapshot
  quantity    Int
}
```

### Store settings (constants in `src/config/store.ts`, not in the database)
```ts
STORE_NAME, STORE_PHONE, STORE_EMAIL, STORE_WHATSAPP, STORE_ADDRESS
FREE_SHIPPING_THRESHOLD = 99900   // ₹999
SHIPPING_FEE = 7900               // ₹79
COD_FEE = 4900                    // ₹49
COD_MAX_ORDER_VALUE = 1000000     // ₹10,000 (above this, COD is hidden)
MAX_QTY_PER_ITEM = 5
```

---

## 3. Folder Structure

```
src/
  app/
    (store)/                 # public storefront, shared header/footer
      page.tsx               # Home
      sarees/page.tsx        # all sarees (with filters)
      kurtis/page.tsx        # all kurtis (with filters)
      category/[slug]/page.tsx
      product/[slug]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      order/[orderNumber]/page.tsx    # confirmation + status (needs phone to view)
      track/page.tsx                  # enter order number + phone
      search/page.tsx
      about/ contact/ privacy-policy/ terms/ shipping-policy/ refund-policy/
    admin/
      login/page.tsx
      (protected)/
        page.tsx             # dashboard = orders list
        orders/[id]/page.tsx
        products/page.tsx
        products/new/page.tsx
        products/[id]/page.tsx
        categories/page.tsx
    api/
      checkout/route.ts            # create order (COD or prepaid)
      razorpay/verify/route.ts     # verify payment signature
      razorpay/webhook/route.ts
      shiprocket/webhook/route.ts
      cloudinary/sign/route.ts     # signed upload for admin
    sitemap.ts
    robots.ts
  components/  (ui/ = shadcn, store/, admin/)
  lib/  (db.ts, money.ts, auth.ts, razorpay.ts, shiprocket.ts, telegram.ts, email.ts, orders.ts, seo.ts)
  emails/  (OrderPlaced.tsx, OrderShipped.tsx)
  config/store.ts
  stores/cart.ts               # Zustand
prisma/  (schema.prisma, seed.ts)
middleware.ts                  # protect /admin routes
```

---

## PHASE 1: Foundation and Design System

**Goal:** Project skeleton, database, design tokens and base layout.

### Tasks
1. Create the Next.js app (TypeScript, App Router, Tailwind, ESLint, `src/` dir).
2. Install and initialise shadcn/ui. Add components as needed: button, input, label, select, sheet, dialog, accordion, badge, separator, table, toast/sonner, skeleton.
3. Set up the colour tokens and fonts from Section 1.
4. Set up Prisma with PostgreSQL. Add the schema from Section 2 and run the first migration.
5. Create `lib/money.ts`: `formatINR(paise)` → `"₹3,499"` using `Intl.NumberFormat('en-IN')`.
6. Create `config/store.ts` with the constants from Section 2.
7. Write `prisma/seed.ts` with 4 categories (Silk Sarees, Cotton Sarees, Party Kurtis, Daily Kurtis) and 12 sample products using placeholder images. Include 2 kurtis with S–XXL variants, and give one variant 0 stock to test "sold out".
8. Build the **Header**: logo (text for now) on the left; links Sarees · Kurtis · New Arrivals; search icon and cart icon with item count on the right. On mobile: hamburger menu (shadcn Sheet), logo in the centre, cart on the right. Sticky, with a white background and a bottom border once the page scrolls.
9. Build the **Footer**: shop links, policy links, contact (phone, email, WhatsApp), Instagram link, © year.
10. Add a floating **WhatsApp button** (bottom-right) that opens `https://wa.me/<STORE_WHATSAPP>`.
11. Create `.env.example` listing every env variable (see Section "Environment Variables").

### Done when
- [ ] `npm run dev` runs with no errors, and `npx prisma db seed` fills the database
- [ ] Header and footer look polished on 360px and 390px phones first, then desktop
- [ ] Safe-area insets and 44px tap targets are in place
- [ ] Fonts and colours match Section 1

---

## PHASE 2: Storefront (Browse Products)

**Goal:** Visitors can browse and view products. All pages are server-rendered.

### Tasks
1. **Product card** component: 4:5 image, second image on hover (desktop), name, price, struck-through MRP plus "% off" if `mrp > price`, and a "Sold out" badge if all variants have 0 stock. The whole card links to the product page.
2. **Home page** (`/`), in this order:
   1. Hero: one full-width image (placeholder), a headline in serif, and a "Shop Sarees" button plus a "Shop Kurtis" button
   2. Category tiles: large image tiles, 2 columns on mobile and 4 on desktop
   3. New Arrivals: the 8 latest active products
   4. Featured: products with `isFeatured`, hidden if there are none
   5. Brand story: an image plus 2–3 lines of text
   6. Trust strip: icons for "Cash on Delivery" · "Free shipping above ₹999" · "Easy exchange" · "Secure payments"
3. **Listing pages** (`/sarees`, `/kurtis`, `/category/[slug]`):
   - Grid: 2 columns on mobile, 3 on tablet, 4 on desktop
   - Filters: category, colour, fabric, occasion, price range, plus size for kurtis. On mobile, sticky bottom **Filter** and **Sort** buttons open bottom sheets. Keep filter state in URL search params so links are shareable and crawlable.
   - Sort: Newest, Price low→high, Price high→low
   - Pagination with 24 per page (use a "Load more" button or numbered pages)
4. **Product page** (`/product/[slug]`):
   - Mobile: **full-width, edge-to-edge swipeable gallery** at the top with dot indicators and tap-to-zoom fullscreen (pinch-zoom). Desktop: main image plus thumbnails on the left.
   - Right: name (serif), price + MRP + % off, size selector for kurtis (disable sold-out sizes; sarees show no selector), quantity (1–5), **Add to Cart** (primary) and **Buy Now** (secondary: add to cart, then go to checkout).
   - Under the buttons: "✓ Cash on Delivery available · ✓ Free shipping above ₹999 · ✓ Ships in 1–2 days"
   - Accordion: Description · Details (fabric, length, blouse piece, fit) · Care · Shipping & Returns
   - "Ask on WhatsApp" link with a prefilled message containing the product name and URL
   - "You may also like": 4 products from the same category (horizontal swipe row on mobile)
   - **Mobile sticky bottom bar:** price + Add to Cart + Buy Now, always visible while scrolling (respects the safe-area inset). Sizes open in a bottom sheet if none is selected.
5. **Search** (`/search?q=`): simple case-insensitive match on product name, fabric, colour and category. The header search icon opens an input.
6. **New Arrivals** link: goes to `/sarees` and `/kurtis` sorted by newest, or a combined `/search?sort=new`. Keep it simple.
7. Product, listing and home pages should use ISR / revalidation (for example `revalidate = 300`) and revalidate on admin product changes.
8. Add loading skeletons and a custom 404 page.

### Done when
- [ ] Every seeded product is reachable from the home page in 2 clicks or fewer
- [ ] Filters and sort work and are reflected in the URL
- [ ] Sold-out sizes can't be selected, and fully sold-out products show a badge
- [ ] On a real phone, browsing feels like a premium fashion app: big images, smooth swipes, sticky actions within thumb reach
- [ ] Lighthouse **mobile** scores are 90+ for Performance, SEO and Accessibility on home and product pages

---

## PHASE 3: Cart and Checkout (COD)

**Goal:** A customer can place a Cash on Delivery order end to end.

### Tasks
1. **Cart store** (Zustand + localStorage): items `{ variantId, productSlug, name, size, image, unitPrice, quantity }`. Actions: add, updateQty, remove, clear.
2. **Cart drawer**: opens from the right when an item is added or the cart icon is clicked. Shows items, quantity +/−, remove, subtotal, and a "Checkout" button. A full `/cart` page shows the same content.
3. **Price calculation** in `lib/orders.ts`, **always done on the server from database prices** (never trust client prices):
   - subtotal = Σ unitPrice × qty
   - shippingFee = subtotal ≥ FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
   - codFee = paymentMethod === COD ? COD_FEE : 0
   - total = subtotal + shippingFee + codFee
4. **Checkout page** (`/checkout`), single page, no login:
   - Contact: full name, 10-digit mobile (validate `^[6-9]\d{9}$`), email
   - Address: line 1, line 2 (optional), pincode (`^\d{6}$`), city, state (dropdown of Indian states/UTs)
   - Payment method radio: **Pay Online (UPI / Card)** or **Cash on Delivery (+₹49)**. Hide COD if total > COD_MAX_ORDER_VALUE.
   - Order summary on the right (desktop) or collapsible at the top (mobile): items, subtotal, shipping, COD fee, total
   - **Sticky bottom "Place Order · ₹total" button on mobile**, with a loading state; disable it while submitting to prevent double orders
   - Mobile keyboards and autofill exactly as described in Section 1A (tel/numeric inputs, `autocomplete` attributes, 16px+ text, 48px inputs)
   - Validate with react-hook-form + Zod
5. **`POST /api/checkout`**:
   - Validate input with Zod. Load the variants from the database. Reject inactive products or a quantity above stock (return a clear error naming the item).
   - **In one database transaction:** decrement stock with a conditional update (`WHERE stock >= qty`) so two buyers can never buy the last piece, create the Order and OrderItems, and generate `orderNumber` (prefix + incrementing number, e.g. `SR1001`).
   - COD → status `PLACED`, paymentStatus `PENDING`. Return `{ orderNumber }`.
   - (Prepaid is handled in Phase 4.)
6. After a successful COD order: clear the cart and redirect to `/order/[orderNumber]?phone=XXXXXXXXXX`.
7. **Order confirmation page**: "Thank you! Your order SR1001 is placed", the items, total, payment method and delivery address. It needs the matching phone (from the query string or a form) to show details, so strangers can't view orders by guessing numbers.
8. **Track order page** (`/track`): the customer enters order number + phone and sees the status timeline (Placed → Confirmed → Shipped → Delivered), plus the courier and a tracking link if shipped.

### Done when
- [ ] A COD order can be placed on a phone in under 1 minute, using autofill, with no zooming or hidden buttons
- [ ] Stock decreases correctly, and buying more than the stock shows an error
- [ ] Changing prices in localStorage does not change the charged total
- [ ] Double-clicking "Place Order" creates only one order

---

## PHASE 4: Online Payments (Razorpay)

**Goal:** A customer can pay by UPI or card.

### Tasks
1. For a `PREPAID` order, `POST /api/checkout`:
   - Runs the same validation and stock-decrement transaction, creating the order with status `PENDING_PAYMENT`
   - Creates a Razorpay order (`amount = total`, `currency = INR`, `receipt = orderNumber`) and saves `razorpayOrderId`
   - Returns `{ orderNumber, razorpayOrderId, amount, keyId }`
2. On the client: load `https://checkout.razorpay.com/v1/checkout.js` and open Razorpay Checkout prefilled with name, email and phone. Use the brand accent colour in the theme.
3. On success → call `POST /api/razorpay/verify` with `razorpay_order_id`, `razorpay_payment_id` and `razorpay_signature`. Verify the HMAC-SHA256 signature on the server with the key secret. If valid: paymentStatus `PAID`, status `PLACED`, save `razorpayPaymentId`. Then clear the cart and redirect to the confirmation page.
4. **Webhook** `POST /api/razorpay/webhook` (events: `payment.captured`, `payment.failed`): verify the webhook signature using `RAZORPAY_WEBHOOK_SECRET`. Make it idempotent so it does nothing if the order is already PAID. This catches cases where the customer closes the browser after paying.
5. **Payment failed or popup closed:** show "Payment not completed" with a "Try again" button (reopen Checkout for the same Razorpay order) and a "Switch to Cash on Delivery" button.
6. **Release stock from abandoned payments:** orders still `PENDING_PAYMENT` after 30 minutes → status `CANCELLED`, and stock is restored. Run this with a Vercel Cron job hitting a protected route (`/api/cron/expire-orders`, secured with `CRON_SECRET`).

### Done when
- [ ] Test-mode UPI and card payments complete and the order shows PAID
- [ ] A tampered signature is rejected
- [ ] Closing the popup leaves the order PENDING_PAYMENT, and it expires after 30 minutes with stock restored
- [ ] The webhook marks an order paid even if the verify call never happened

---

## PHASE 5: Notifications

**Goal:** The owner knows about every order instantly, and the customer gets confirmations.

### Tasks
1. **Telegram alert to the owner** (`lib/telegram.ts`). Send it when an order becomes `PLACED` (COD placed, or prepaid paid):
   ```
   🛍️ NEW ORDER SR1045
   Payment: COD (₹2,548) | or PREPAID ✅ (₹2,499)
   Items:
   • Peacock Paithani Silk Saree (Free Size) × 1
   Customer: Priya S, 98XXXXXX21
   Pune, Maharashtra 411038
   👉 <SITE_URL>/admin/orders/<id>
   ```
   Also alert on RTO and NDR events from Phase 7.
2. **Emails to the customer** (`lib/email.ts`, Resend + React Email, simple branded template):
   - **Order placed:** order number, items, total, payment method, address, link to the track page
   - **Order shipped:** courier name, AWB, tracking link
3. **Failures must not block orders.** Wrap notification calls in try/catch, log errors, and never fail checkout because Telegram or email failed.

### Done when
- [ ] The owner gets a Telegram message within seconds of a COD order and of a successful prepaid order
- [ ] The customer receives a "placed" email, and a "shipped" email after shipping (Phase 7)

---

## PHASE 6: Admin Panel

**Goal:** The owner can manage products and orders from a phone or laptop.

Keep it plain and functional. **Build it mobile first too**: the owner will mostly use it on a phone. On mobile, show orders as **cards** instead of wide tables; use a top or bottom menu (sidebar only on desktop); keep action buttons large.

### Tasks
1. **Auth:** `/admin/login` with a password form. Compare against `ADMIN_PASSWORD` (constant-time compare), then set a signed HTTP-only cookie (`jose`, 7-day expiry). `middleware.ts` protects everything under `/admin` except login, and all admin server actions re-check the session. Add simple rate limiting on login (for example 5 attempts per 15 minutes per IP).
2. **Orders list** (admin home):
   - Table: order number, date, customer, phone, total, payment (COD/PAID badge), status badge
   - Status filter tabs: Placed · Confirmed · Shipped · Delivered · Cancelled/RTO · All
   - Newest first, with search by order number or phone
3. **Order detail page:**
   - All customer and address details (with copy buttons), items with images, price breakdown, payment info
   - Action buttons depend on the status:
     - `PLACED` → **Confirm** · **Cancel**
     - `CONFIRMED` → **Ship with Shiprocket** (Phase 7) · **Cancel**
     - `SHIPPED` → **Download label** · manual **Mark Delivered** / **Mark RTO** (fallback)
   - Cancelling restores stock. For a PAID order, show a note: "Refund manually from the Razorpay dashboard", plus a **Mark Refunded** button.
   - A "Call customer" `tel:` link and a "WhatsApp customer" link (useful for confirming COD orders)
   - An admin note text field
4. **Products list:** image, name, category, price, total stock, active toggle. Search by name.
5. **Product form** (create and edit):
   - Fields: name, slug (auto from name, editable), type, category, price (entered in ₹ and stored in paise), MRP, fabric, colour, occasion, description, details, care, weight, featured, active
   - Images: upload several to Cloudinary (signed upload), **straight from the phone camera or gallery**, reorder (touch-friendly up/down buttons or drag), delete
   - Variants: for SAREE, a single "Free Size" row with stock. For KURTI, rows per size (S, M, L, XL, XXL), each with stock. SKU is auto-generated.
   - On save, revalidate the affected storefront pages
6. **Categories:** a simple list where you can add, edit, reorder or delete (block delete if the category has products). Fields: name, slug, type, image.

### Done when
- [ ] The owner can do everything from a phone: add a saree with camera photos, confirm and ship orders
- [ ] The owner can confirm, cancel and update orders, and stock stays correct
- [ ] `/admin` routes and admin actions are inaccessible without login

---

## PHASE 7: Shipping (Shiprocket)

**Goal:** One click ships an order. Tracking updates happen automatically.

> Check the endpoints and payloads against the current Shiprocket API docs before implementing.

### Tasks
1. `lib/shiprocket.ts`:
   - **Auth:** `POST /v1/external/auth/login` with the API user's email and password → token. Cache it (in the database or memory) and refresh before it expires (tokens last about 10 days).
   - `createOrder(order)` → `POST /v1/external/orders/create/adhoc` with order number, date, pickup location name, billing/shipping address, items, `payment_method` ("COD" or "Prepaid"), sub_total, and package dimensions/weight (sum of item weights; default box size in config).
   - `assignAwb(shipmentId)` → `POST /v1/external/courier/assign/awb` (auto courier selection)
   - `generatePickup(shipmentId)` → `POST /v1/external/courier/generate/pickup`
   - `generateLabel(shipmentId)` → `POST /v1/external/courier/generate/label` → label PDF URL
2. The admin **"Ship with Shiprocket"** button runs create order → assign AWB → generate pickup. It saves `shiprocketOrderId`, `shiprocketShipmentId`, `awbCode`, `courierName` and `trackingUrl`, sets status `SHIPPED`, and sends the "shipped" email. If any step fails, show the exact error in admin and leave the order `CONFIRMED` so it can be retried.
3. **Download label** button → opens the label PDF.
4. **Webhook** `POST /api/shiprocket/webhook`: check a secret token (configured in the Shiprocket dashboard, sent in a header). Map Shiprocket statuses to ours:
   - Delivered → `DELIVERED`. Also, for COD, set paymentStatus to `PAID`.
   - RTO initiated or delivered → `RTO`, plus a Telegram alert. When the RTO parcel arrives back, the owner restocks it manually from admin with a "Restock items" button.
   - NDR / undelivered attempt → Telegram alert only
   - Keep it idempotent, and ignore unknown statuses.
5. **Manual fallback:** admin can also enter an AWB and courier by hand (for shipping without Shiprocket).

### Done when
- [ ] In Shiprocket, a test order is created with an AWB from one button click
- [ ] A webhook test call updates the order status
- [ ] The customer sees the courier and a tracking link on `/track`

---

## PHASE 8: SEO, Legal Pages and Launch

**Goal:** The site is ready for Google and ready for Razorpay approval.

### Tasks
1. **Metadata** (`generateMetadata`) on every page: unique title (`"<Product> | <Store>"`), description, canonical URL, Open Graph image (the product's main image) so WhatsApp and Instagram link previews look good.
2. **Structured data (JSON-LD):**
   - Product page: `Product` with name, images, description, sku, brand, `offers` (price in INR, availability InStock/OutOfStock, url)
   - Product and category pages: `BreadcrumbList`
   - Home: `Organization` + `WebSite`
3. `app/sitemap.ts` (home, listing pages, categories, all active products, policy pages) and `app/robots.ts` (disallow `/admin`, `/api`, `/checkout`, `/cart`, `/order`).
4. **Google Merchant Center feed:** `/feed.xml` route producing an RSS 2.0 / Google Shopping feed (id, title, description, link, image_link, price "3499.00 INR", availability, brand, condition "new", google_product_category "Apparel & Accessories > Clothing").
5. **Image SEO:** every product image `alt` = product name + colour + fabric. Use `next/image` with proper `sizes`.
6. **Static pages** (simple, well-typeset; the owner will edit the text): About, Contact (phone, email, WhatsApp, address), Privacy Policy, Terms & Conditions, Shipping Policy, Refund & Exchange Policy. **Razorpay requires these to be live before account activation.**
7. **Mobile performance and polish pass:** fonts via `next/font`, compressed images (Cloudinary `f_auto,q_auto`), no unneeded client JS on storefront pages. Test every page on a real Android phone over 4G and on an iPhone (Safari): sticky bars, safe areas, keyboards, swipes. Fix anything that doesn't feel smooth.
8. **Security pass:** all inputs validated with Zod, secrets only on the server, webhook signatures verified, admin protected, no prices taken from the client, `.env` in `.gitignore`.
9. **Deploy:**
   - Push to GitHub, then import the project in Vercel and add all env variables
   - Connect the custom domain (`yourbrand.in`)
   - Run `prisma migrate deploy` on the production database
   - Set up the Vercel Cron job for expiring unpaid orders
   - Switch Razorpay to live keys, set the Razorpay and Shiprocket webhook URLs to the production domain
   - Submit the sitemap in Google Search Console, and submit `/feed.xml` in Google Merchant Center
10. **Final launch test on production:** place 1 real COD order and 1 real ₹1 prepaid order (a temporary test product), ship one through Shiprocket, then cancel/refund both.

### Done when
- [ ] Google's Rich Results Test passes for a product page
- [ ] The sitemap, robots.txt and feed load correctly
- [ ] All policy pages are live
- [ ] Lighthouse **mobile** 90+ on the production site, and every page reviewed on real phones
- [ ] The production test orders work end to end

---

## Environment Variables

```
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=

ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
SHIPROCKET_PICKUP_LOCATION=
SHIPROCKET_WEBHOOK_TOKEN=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

RESEND_API_KEY=
EMAIL_FROM=

CRON_SECRET=
```

---

## Out of Scope (do NOT build)

Customer accounts/login · wishlist · product reviews · coupons/discount codes · blog · abandoned cart reminders · WhatsApp API automation · SMS · multi-currency/language · loyalty/referral · live chat · analytics dashboards · inventory reports · return-request portal (handle returns over WhatsApp).

These can be added later, after the store is making sales.

---

## Summary Checklist

**Applies to every phase: Mobile first (Section 1A)**
- [ ] Designed for 390px phones first, premium-app feel
- [ ] Sticky bottom actions, bottom sheets, swipe galleries, 44px tap targets
- [ ] Mobile keyboards and autofill on forms, safe-area support
- [ ] Fast on mid-range Android over 4G (Lighthouse mobile 90+)
- [ ] Admin panel usable on a phone

**Phase 1: Foundation**
- [ ] Next.js + TypeScript + Tailwind + shadcn/ui + Framer Motion
- [ ] Prisma + PostgreSQL schema and seed data
- [ ] Design tokens (colours, fonts), header, footer, WhatsApp button

**Phase 2: Storefront**
- [ ] Home page (hero, categories, new arrivals, featured, story, trust strip)
- [ ] Listing pages with filters and sort
- [ ] Product page (full-width swipe gallery, size bottom sheet, sticky Add to Cart / Buy Now bar, accordion details)
- [ ] Search, 404, loading states

**Phase 3: Cart and COD checkout**
- [ ] Cart drawer + cart page
- [ ] Guest checkout form with validation
- [ ] Server-side price calculation and safe stock decrement
- [ ] Order confirmation and track order pages

**Phase 4: Razorpay**
- [ ] Prepaid checkout with signature verification
- [ ] Webhook backup
- [ ] Retry / switch to COD on failure
- [ ] Auto-expire unpaid orders (cron)

**Phase 5: Notifications**
- [ ] Telegram alert to the owner on every new order
- [ ] Customer emails: order placed, order shipped

**Phase 6: Admin**
- [ ] Password login + protected routes
- [ ] Orders list, order detail, status actions
- [ ] Product create/edit with Cloudinary images and size variants
- [ ] Categories management

**Phase 7: Shiprocket**
- [ ] One-click shipping (order → AWB → pickup → label)
- [ ] Tracking webhook (Delivered / RTO / NDR)
- [ ] Manual AWB fallback

**Phase 8: SEO and launch**
- [ ] Metadata, Open Graph, JSON-LD, sitemap, robots
- [ ] Google Merchant feed
- [ ] Policy pages (needed for Razorpay)
- [ ] Performance + security pass
- [ ] Deploy to Vercel, live keys, webhooks, Search Console, production test orders
