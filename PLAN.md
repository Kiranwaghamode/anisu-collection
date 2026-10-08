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
| 5 | Customer emails | ✅ Done | `632cd14` |
| 6 | SEO, legal pages, speed and security (code) | ✅ Done | (this commit) |
| **Launch** | **Deploy and go live** | ⏳ Needs the owner (see 🚀 Launch guide) | — |
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

### Phase 6: SEO, legal pages, speed and security
- Every page has a title, description, canonical URL and link preview (WhatsApp/Instagram). Product pages use
  the product photo; other pages use a branded card at `/og.png`. Brand icon (`app/icon.tsx`, `apple-icon.tsx`)
- Google structured data (`lib/structured-data.ts`): `Product` with price, stock, shipping and return policy, and
  `BreadcrumbList` on product/listing/category pages; `OnlineStore` + `WebSite` (with site search) on the home page
- `/sitemap.xml` (with product images), `/robots.txt` (blocks admin, api, checkout, cart, order pages),
  `/feed.xml` Google Merchant Center feed. All refresh within 5 minutes, or at once when the admin saves
- Product photo alt text = name + colour + fabric
- Pages: About, Contact, Shipping Policy, Refund & Exchange Policy, Privacy Policy, Terms & Conditions (drafts).
  Policy numbers (dispatch days, delivery days, exchange window) live in `src/config/store.ts`, shared by the
  pages, product pages and Google data
- Speed: photos resized and converted (WebP/AVIF) by Cloudinary through a custom `next/image` loader
  (`lib/image-loader.ts`), so Vercel's image quota isn't used; animation library removed (−35 KB JS)
- Security: every admin page, action and API checks the login; all inputs validated with Zod; prices only from
  the database; no secrets in client code or `.env.example`; security headers (no framing, nosniff, referrer policy)
- Checked: production build passes; Lighthouse mobile (local, placeholder photos): Accessibility 100, Best
  Practices 100, SEO 100, Performance 78–84 (real LCP ≈ 0.6 s; the simulated slow-4G score should be re-checked on
  production with real Cloudinary photos)
- `npm audit` warnings are in build-time CLIs (prisma, shadcn), not in the running site; the suggested "fix"
  downgrades Prisma and would break the build, so it was not applied

---

## 🚀 Launch guide (owner + me)

Everything in the code is done. These steps need your accounts. Do them in order; tell me when you reach one
and I'll help.

### 1. Fill in the last store details (`src/config/store.ts`)
- `GRIEVANCE_OFFICER`: your full name (shown in the Privacy Policy and Terms; required by Indian e-commerce rules)
- `STORE_ADDRESS`: add the pincode; check `STORE_INSTAGRAM` and `STORE_HOURS`
- `DISPATCH_DAYS`, `TRANSIT_DAYS`, `RETURN_WINDOW_DAYS`, `DAMAGE_REPORT_HOURS`: check they match how you work
- Read the drafts of About and the four policy pages and change anything that isn't true for your shop
  (`src/app/(store)/about`, `refund-policy`, …). Update `POLICIES_UPDATED` in `src/config/pages.ts` when you do

### 2. Real photos
- Upload your product photos in `/admin` → Products, and category photos in `/admin` → Categories
- Replace the two home page photos (`HERO_IMAGE`, `STORY_IMAGE` in `src/app/(store)/page.tsx`)
- Delete or hide the 12 sample products, and cancel test order **AC1001** in `/admin` (puts the stock back)

### 3. Domain
- Buy a domain (e.g. `anisucollection.in`) from GoDaddy, Hostinger or Namecheap

### 4. Vercel (hosting)
1. Push the code to GitHub (`git push`)
2. vercel.com → sign up with GitHub → **Add New → Project** → import the repo
3. Add the environment variables from your `.env` (all of them except the Razorpay/Shiprocket/Telegram ones),
   and set `NEXT_PUBLIC_SITE_URL=https://yourdomain.in` (**before** the first deploy; the sitemap, feed and
   links are built with it)
4. Deploy. Then **Settings → Domains** → add your domain and copy the DNS records it shows into your domain
   provider's DNS settings
5. Production uses the same Neon database as now (the schema is already migrated). If you create a separate
   production database, run `npx prisma migrate deploy` with its `DIRECT_URL`, then `npx prisma db seed` only
   if you want the sample data

### 5. Emails to every customer (Resend)
- Resend → **Domains → Add Domain** → add the DNS records → **Verify**
- On Vercel, change `EMAIL_FROM` to e.g. `Anisu Collection <orders@yourdomain.in>` and redeploy
- Until then, order emails only reach your own Gmail

### 6. Launch test on the live site
- Place one COD order with your own details, then in `/admin`: Confirm → Mark shipped → Delivered.
  Check both emails arrive, then cancel the order
- Open the site on an Android phone and an iPhone and click through every page
- Run Lighthouse (Chrome DevTools → Lighthouse → Mobile) on the home page and a product page

### 7. Google
- **Search Console** (search.google.com/search-console): add the domain, then **Sitemaps** → submit `sitemap.xml`
- **Rich Results Test** (search.google.com/test/rich-results): test one product page; it should find
  "Product snippets" and "Merchant listings"
- **Merchant Center** (merchants.google.com, optional, free listings): business info → **Products → Feeds** →
  add a scheduled fetch of `https://yourdomain.in/feed.xml` (daily); set shipping to India

### Done when
- [ ] Google's Rich Results Test passes for a product page
- [ ] Sitemap, robots.txt and the feed load on the live domain
- [ ] All policy pages are live with the owner's final text
- [ ] Lighthouse mobile 90+ on production, every page reviewed on real phones
- [ ] The production test order works end to end

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
