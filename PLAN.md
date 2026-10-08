# Build Plan & Progress (Anisu Collection)

> **This file is the source of truth for what's left.** It replaces the remaining phases of `BUILD_PLAN.md`.
> Sections 0–3 of `BUILD_PLAN.md` (design system, mobile-first rules, data model, folder structure) and its
> "Out of Scope" list still apply.
>
> **Owner's decisions**
> - 2026-10-07: launch with **Cash on Delivery only**. Razorpay and Shiprocket are postponed. Orders the site
>   can't take (COD above ₹10,000) go to WhatsApp.
> - 2026-10-07: the **Telegram owner alert is postponed** too. Customers still get emails.
>
> Workflow: one phase at a time → check its "Done when" list → commit → stop for the owner's review.

## Status

| Phase | What | Status | Commit |
|---|---|---|---|
| 1 | Foundation and design system | ✅ Done | `4828814` |
| 2 | Storefront (browse products) | ✅ Done | `12945f3` |
| 3 | Cart and COD checkout | ✅ Done | `03a216c` |
| 4 | Admin panel | ✅ Done | `6f793bc` |
| 5 | Customer emails | ✅ Done | (this commit) |
| **6** | **SEO, legal pages and launch** | ⏳ To do | — |
| — | Telegram owner alert | 💤 Later | — |
| — | Razorpay online payments | 💤 Later | — |
| — | Shiprocket shipping | 💤 Later | — |

---

## ✅ What's built so far

### Phase 1: Foundation
- Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4 + shadcn/ui, Prisma 7 + Neon Postgres
- Design tokens (off-white, maroon accent), Cormorant Garamond + Inter, safe-area and 44px tap-target utilities
- Header (mobile menu bottom sheet, search, cart count), footer, floating WhatsApp button
- Database schema, migrations, seed data (4 categories, 12 products, sold-out test cases)

### Phase 2: Storefront
- Home: hero, category tiles, New Arrivals swipe row, Featured, brand story, trust strip
- Listings (`/sarees`, `/kurtis`, `/category/[slug]`): filters (category, size, colour, fabric, occasion, price),
  sort, "Load more", state kept in the URL; Filter/Sort bottom sheets on phones
- Product page: swipe gallery with tap-to-zoom, size picker (sold-out sizes disabled), quantity,
  sticky Add to Cart / Buy Now bar, details accordion, Ask on WhatsApp, "You may also like"
- Search (header search sheet + `/search`), loading skeletons, custom 404
- Catalog cached and refreshed every 5 minutes, or instantly when the admin saves

### Phase 3: Cart and COD checkout
- Cart drawer + `/cart`, live prices and stock checked against the database
- Checkout form: right keyboards, autofill, validation, sticky "Place Order · ₹total"
- `POST /api/checkout`: server-side pricing, stock taken safely in one transaction (no overselling),
  order numbers AC1001, AC1002… from a database sequence; double taps can't create two orders
- Order confirmation (needs the matching phone) and `/track` with a status timeline

### Phase 4: Admin panel (`/admin`)
- Password login (7-day signed cookie, 5 attempts per 15 minutes), every page and action protected
- Orders: status tabs, search, detail page with copy buttons, Call / WhatsApp (pre-written message),
  admin note; Confirm → Mark shipped (courier, tracking number, link) → Delivered, plus Cancel and RTO
  (both restock); Delivered marks COD as paid
- Products: list with Live/Hidden switch; add/edit form with photo upload from camera or gallery
  (Cloudinary, resized on the phone), stock per size, auto SKUs, filter-friendly suggestions
- Categories: add, edit, reorder (home tile order), delete (blocked while in use)
- Checkout: "Order on WhatsApp" when COD isn't available (above ₹10,000)

### Phase 5: Customer emails
- `lib/email.ts` (Resend) + React Email templates in `src/emails/`:
  - **Order placed:** items with photos, totals, payment, address, "Track your order" button
  - **Order shipped** (sent when the owner clicks Mark shipped): courier, tracking number, tracking link
- Sent with `after()` once the response has gone out; if Resend is down or keys are missing, the order or
  admin action still succeeds and the problem is logged
- `scripts/preview-notifications.tsx AC1001` renders both emails to `.previews/` for checking the design
- Tested 2026-10-08 with the owner's key: test order AC1001 sent the "placed" email through the real checkout,
  and the "shipped" email arrived too; both checked by the owner in Gmail
- Replies go to `STORE_EMAIL` (owner's Gmail). Sender is `onboarding@resend.dev` until the domain is verified
  in Resend, which only delivers to the owner's own address, so **verifying the domain is a launch step** (Phase 6)

---

## ⏳ PHASE 6: SEO, Legal Pages and Launch

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
6. **Static pages** (drafts for the owner to edit): About, Contact (phone, email, WhatsApp, address),
   Privacy Policy, Terms & Conditions, Shipping Policy, Refund & Exchange Policy. These are also required
   before Razorpay will activate an account later.
7. **Performance and polish pass:** serve Cloudinary images with `f_auto,q_auto` (custom image loader),
   no unneeded client JS on storefront pages, Lighthouse mobile 90+. Test every page on a real Android phone
   (4G) and an iPhone (Safari).
8. **Security pass:** Zod on all inputs, secrets only on the server, admin protected, no client prices,
   `.env` git-ignored, no secrets in `.env.example`.
9. **Deploy:** import the GitHub repo in Vercel, add env variables, connect the domain, run
   `prisma migrate deploy` on production, submit the sitemap in Search Console and `/feed.xml` in Merchant Center.
10. **Launch test on production:** place one real COD order, take it through Confirm → Shipped → Delivered
    in the admin, check both emails, then cancel or clean it up.

### Done when
- [ ] Google's Rich Results Test passes for a product page
- [ ] Sitemap, robots.txt and the feed load correctly
- [ ] All policy pages are live
- [ ] Lighthouse mobile 90+ on production, every page reviewed on real phones
- [ ] The production test order works end to end

### Needs from the owner
- A Vercel account, the domain name, the real store contact details (`src/config/store.ts` still has
  placeholders) and the final text for the About and policy pages (I'll write drafts to edit)
- Real product photos (Unsplash placeholders are still used for the seed products)

---

## 💤 Later (postponed by the owner)

### Telegram owner alert
Instant Telegram message to the owner for every new order:
```
🛍️ NEW ORDER AC1001
Payment: COD (₹2,548)
Items:
• Peacock Paithani Silk Saree (Free Size) × 1
Customer: Priya S, 98XXXXXX21
Pune, Maharashtra 411038
👉 <SITE_URL>/admin/orders/<id>
```
Plug-in point: `notifyOrderPlaced()` in `src/lib/notify.ts`, which already runs after every order.
Needs a bot from @BotFather (`TELEGRAM_BOT_TOKEN`) and the owner's chat id (`TELEGRAM_CHAT_ID`).
Until then the owner sees new orders in the admin (the Placed tab shows a count).

### Razorpay online payments
`BUILD_PLAN.md` Phase 4 as written: prepaid orders in `PENDING_PAYMENT`, Razorpay Checkout, server-side
signature verification, webhook backup, "Try again / Switch to COD", and a cron job that cancels unpaid
orders after 30 minutes and restores stock. The database already has the Razorpay fields, and the test
keys are saved in the local `.env`. The "placed" email (and Telegram alert, once added) should also fire
when a prepaid payment succeeds.

### Shiprocket shipping
`BUILD_PLAN.md` Phase 7 as written: one-click ship (order → AWB → pickup), label download, tracking
webhook (Delivered / RTO / NDR). It will become the main way to ship; the manual **Mark shipped** form stays
as a fallback, and the "shipped" email already fires from there. The database already has the Shiprocket fields.
