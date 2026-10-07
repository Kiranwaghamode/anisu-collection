# Remaining Build Plan (no payments or Shiprocket for now)

> **Supersedes the remaining phases of `BUILD_PLAN.md`.** Sections 0–3 of `BUILD_PLAN.md` (design system,
> mobile-first rules, data model, folder structure) and its "Out of Scope" list still apply.
>
> **Owner's decision (2026-10-07):** launch with **Cash on Delivery only**. Razorpay and Shiprocket are
> postponed (see "Later" at the bottom). Orders the site can't take (e.g. COD above ₹10,000) go to WhatsApp.
>
> Same workflow as before: build one phase at a time, check its "Done when" list, commit, then stop for
> the owner's review.

## Status

| Phase | What | Status |
|---|---|---|
| 1 | Foundation and design system | ✅ Done |
| 2 | Storefront (browse products) | ✅ Done |
| 3 | Cart and COD checkout | ✅ Done |
| **4** | **Admin panel** | Next |
| **5** | **Notifications (Telegram + email)** | To do |
| **6** | **SEO, legal pages and launch** | To do |
| — | Razorpay online payments | Later |
| — | Shiprocket shipping | Later |

The admin panel comes before notifications because the Telegram alert links to the admin order page,
and the "shipped" email is sent when the owner marks an order shipped in the admin.

---

## PHASE 4: Admin Panel

**Goal:** The owner can manage products and orders from a phone or laptop.

Plain and functional, **mobile first**: orders as cards on phones (table only on desktop), top/bottom
menu on phones (sidebar only on desktop), large action buttons.

### Tasks
1. **Auth:** `/admin/login` password form, compared with `ADMIN_PASSWORD` in constant time. On success, set a
   signed HTTP-only cookie (`jose`, 7-day expiry, `ADMIN_SESSION_SECRET`). `proxy.ts` (Next 16's name for
   `middleware.ts`) protects everything under `/admin` except the login page, and every admin server action
   re-checks the session. Rate-limit login: 5 attempts per 15 minutes per IP. Logout button.
2. **Orders list** (admin home):
   - Order number, date, customer, phone, total, status badge (cards on phones, table on desktop)
   - Status tabs: Placed · Confirmed · Shipped · Delivered · Cancelled/RTO · All
   - Newest first; search by order number or phone
3. **Order detail page:**
   - Customer and address details with copy buttons, items with images, price breakdown
   - **Call customer** (`tel:`) and **WhatsApp customer** links (for confirming COD orders)
   - Admin note field
   - Actions by status:
     - `PLACED` → **Confirm** · **Cancel**
     - `CONFIRMED` → **Mark Shipped** (form: courier name, tracking number/AWB, tracking link optional) · **Cancel**
     - `SHIPPED` → **Mark Delivered** · **Mark RTO** (returned to us)
   - **Cancel** and **Mark RTO** put the items' stock back. Each status change is guarded so a double tap
     can't apply it twice.
4. **Products list:** image, name, category, price, total stock, active toggle; search by name.
5. **Product form** (create and edit):
   - Fields: name, slug (auto from name, editable), type, category, price (typed in ₹, stored in paise), MRP,
     fabric, colour, occasion, description, details, care, weight, featured, active
   - **Images:** signed upload to Cloudinary (`/api/cloudinary/sign`), straight from the phone camera or
     gallery; several at once; reorder with large up/down buttons; delete
   - **Variants:** SAREE → one "Free Size" row with stock. KURTI → one row per size (S–XXL) with stock.
     SKU generated automatically.
   - On save, `updateTag(CATALOG_TAG)` so the storefront updates immediately
6. **Categories:** add, edit, reorder, delete (blocked while the category has products). Fields: name, slug,
   type, image (Cloudinary upload).
7. **Checkout tweak:** when COD isn't available (order above ₹10,000), show a **"Order on WhatsApp"** button
   with the cart items prefilled in the message. "Pay Online" stays visible as "Coming soon".

### Done when
- [ ] From a phone, the owner can add a saree with camera photos, then confirm and ship an order
- [ ] Confirm, cancel, ship, delivered and RTO all work, and stock stays correct
- [ ] `/admin` pages and admin actions can't be used without logging in; login is rate-limited

### Needs from the owner
- `ADMIN_PASSWORD` (I generate `ADMIN_SESSION_SECRET`)
- A free Cloudinary account: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## PHASE 5: Notifications

**Goal:** The owner knows about every order instantly, and the customer gets confirmations.

### Tasks
1. **Telegram alert to the owner** (`lib/telegram.ts`) when a COD order is placed:
   ```
   🛍️ NEW ORDER AC1001
   Payment: COD (₹2,548)
   Items:
   • Peacock Paithani Silk Saree (Free Size) × 1
   Customer: Priya S, 98XXXXXX21
   Pune, Maharashtra 411038
   👉 <SITE_URL>/admin/orders/<id>
   ```
2. **Customer emails** (`lib/email.ts`, Resend + React Email, simple branded template):
   - **Order placed:** order number, items, total, payment method, address, link to the track page
   - **Order shipped** (sent when the owner clicks Mark Shipped): courier, tracking number, tracking link
3. **Failures never block orders.** Notifications run after the response (`after()`), wrapped in try/catch
   and logged. Checkout and admin actions succeed even if Telegram or email is down.

### Done when
- [ ] The owner gets a Telegram message within seconds of a COD order
- [ ] The customer receives the "placed" email, and the "shipped" email after Mark Shipped

### Needs from the owner
- A Telegram bot (via @BotFather) and the chat ID: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- A Resend account with the store's domain verified: `RESEND_API_KEY`, `EMAIL_FROM`
  (until the domain is verified, Resend only delivers to the account owner's own email)

---

## PHASE 6: SEO, Legal Pages and Launch

**Goal:** The site is ready for Google and ready for real customers.

### Tasks
1. **Metadata** on every page: unique title (`"<Product> | Anisu Collection"`), description, canonical URL,
   Open Graph image (product's main image) for good WhatsApp/Instagram previews.
2. **Structured data (JSON-LD):** `Product` (name, images, description, sku, brand, offers with INR price,
   InStock/OutOfStock, url) and `BreadcrumbList` on product and category pages; `Organization` + `WebSite`
   on the home page.
3. **`sitemap.ts` and `robots.ts`:** sitemap with home, listings, categories, active products, policy
   pages; robots disallows `/admin`, `/api`, `/checkout`, `/cart`, `/order`.
4. **Google Merchant Center feed** at `/feed.xml` (id, title, description, link, image_link,
   price "3499.00 INR", availability, brand, condition "new",
   google_product_category "Apparel & Accessories > Clothing").
5. **Image SEO:** product image `alt` = name + colour + fabric; correct `sizes`.
6. **Static pages** (the owner edits the text): About, Contact (phone, email, WhatsApp, address),
   Privacy Policy, Terms & Conditions, Shipping Policy, Refund & Exchange Policy. These are also required
   before Razorpay will activate an account later.
7. **Performance and polish pass:** Cloudinary `f_auto,q_auto` images, no unneeded client JS on storefront
   pages, Lighthouse mobile 90+. Test every page on a real Android phone (4G) and an iPhone (Safari).
8. **Security pass:** Zod on all inputs, secrets only on the server, admin protected, no client prices,
   `.env` git-ignored, no secrets in `.env.example`.
9. **Deploy:** import the GitHub repo in Vercel, add env variables, connect the domain, run
   `prisma migrate deploy` on production, submit the sitemap in Search Console and `/feed.xml` in Merchant Center.
10. **Launch test on production:** place one real COD order, take it through Confirm → Shipped → Delivered
    in the admin, check the Telegram alert and both emails, then cancel or clean it up.

### Done when
- [ ] Google's Rich Results Test passes for a product page
- [ ] Sitemap, robots.txt and the feed load correctly
- [ ] All policy pages are live
- [ ] Lighthouse mobile 90+ on production, every page reviewed on real phones
- [ ] The production test order works end to end

### Needs from the owner
- A Vercel account, the domain name, and the final text for the About and policy pages
  (I'll write sensible drafts to edit)

---

## Later (postponed by the owner)

### Razorpay online payments
`BUILD_PLAN.md` Phase 4 as written: prepaid orders in `PENDING_PAYMENT`, Razorpay Checkout, server-side
signature verification, webhook backup, "Try again / Switch to COD", and a cron job that cancels unpaid
orders after 30 minutes and restores stock. The database already has the Razorpay fields, and the test
keys are saved in the local `.env`. The Telegram alert and "placed" email will also fire when a prepaid
payment succeeds.

### Shiprocket shipping
`BUILD_PLAN.md` Phase 7 as written: one-click ship (order → AWB → pickup), label download, tracking
webhook (Delivered / RTO / NDR alerts). It will replace the manual **Mark Shipped** form as the main way
to ship; the manual form stays as a fallback. The database already has the Shiprocket fields.
