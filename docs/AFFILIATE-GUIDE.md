# Affiliate Program Guide

A step-by-step guide for registering on MercadoLibre Argentina and Amazon Associates (US), generating affiliate-tagged URLs, and updating the laptop catalog in Supabase.

## Overview

The "Comprar Ahora" button in `src/components/catalog/detail-overlay.tsx` already renders `laptop.affiliate_link` as its `href`:

```tsx
<a
  href={laptop.affiliate_link}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`Comprar ${laptop.name}`}
>
  Comprar Ahora
</a>
```

No frontend code changes are needed. The only work required is:

1. Register on the affiliate programs below
2. Generate a tagged URL for each laptop in the catalog
3. Store the URL in the `affiliate_link` column of the `laptops` table in Supabase

Each laptop has a single `affiliate_link` field — it points to whichever platform the laptop is listed on (MercadoLibre or Amazon.com).

---

## MercadoLibre Argentina — Programa de Afiliados

### Registration

1. Go to `https://www.mercadolibre.com.ar/l/afiliados`
2. Sign in with your active MercadoLibre account (you must also have a Mercado Pago account)
3. You must be 18+ years old
4. Complete the registration form — it asks for your social media profiles or content channel info
5. Submit and wait for the confirmation email
6. Click the activation link in the email

**Commission rates (computers/electronics):** 2–4%
**Payment:** Credited to your Mercado Pago account 60 days after delivery confirmation

**Note on approval tiers:** The basic affiliate program (2–4% on electronics) is open to anyone 18+ with an account. There is a higher-tier "influencer" program that requires 10k+ followers — you do not need that tier for this use case.

### Generating MercadoLibre Affiliate Links

After your account is approved and active:

1. Log in to `mercadolibre.com.ar`
2. Browse to the product page of the laptop you want to link
3. An affiliate toolbar (commonly called a "blue bar") will appear at the top of the product page once you are logged in as an affiliate
4. Click the toolbar to generate the affiliate-tagged URL for that product
5. Copy the full generated URL — this is what goes into `laptops.affiliate_link`

**Important:** The exact URL parameter format that MercadoLibre uses is not publicly documented. The dashboard generates opaque redirect URLs. Do not attempt to construct them manually — always use the toolbar-generated URL.

---

## Amazon Associates (US Program)

### Why the US Program

`amazon.com.ar` does not exist — Amazon has no local Argentine storefront. Argentine customers purchase from `amazon.com` (US) with international shipping. Therefore, use the **US Amazon Associates program**, not a regional Latin American one.

### Registration

1. Go to `https://affiliate-program.amazon.com/`
2. Sign in with your existing Amazon.com account or create one
3. Complete your Associate profile:
   - Website URL (you can use your app URL or a personal/professional site)
   - Content type (e.g., "technology review site" or "product recommendation app")
   - Expected monthly visitors
4. You receive your **Associate Store ID** upon profile completion (format: `yourname-20`)
5. You can start generating links immediately via SiteStripe
6. Full program approval requires 3 qualifying sales within 180 days of registration

**Commission rates (electronics/laptops):** approximately 4–5%

### Generating Amazon Affiliate Links

After registering and receiving your Associate Store ID:

1. Log in to `amazon.com`
2. Browse to the laptop product page
3. The **SiteStripe** toolbar appears at the top of the page while you are logged in as an associate
4. Click "Get Link" > "Text" to copy the short affiliate URL
5. Alternatively, build the URL manually using this format:

### Amazon Affiliate Link Format

```
https://www.amazon.com/dp/{ASIN}/?tag={associate-id}
```

**Example:**
```
https://www.amazon.com/dp/B0BN9L5FKK/?tag=mysite-20
```

- `{ASIN}` is the 10-character Amazon product identifier (visible in the product URL or under "Product Information" on the listing)
- `{associate-id}` is your Associate Store ID (e.g., `mysite-20`)

---

## Updating Laptop Records in Supabase

After generating affiliate links for each laptop, update the `affiliate_link` column.

### Option A: Supabase Dashboard (recommended for small updates)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** > `laptops`
3. Find the laptop row you want to update
4. Click the cell in the `affiliate_link` column and paste the tagged URL
5. Click outside the cell or press Enter to save

### Option B: SQL Editor

Run the following SQL in the Supabase SQL Editor:

```sql
-- Update a single laptop's affiliate link
UPDATE laptops
SET affiliate_link = 'https://www.amazon.com/dp/B0BN9L5FKK/?tag=yoursite-20'
WHERE name = 'Asus VivoBook Pro 16 OLED';

-- Update a MercadoLibre laptop
UPDATE laptops
SET affiliate_link = 'https://www.mercadolibre.com.ar/...'
WHERE name = 'Lenovo IdeaPad 15AMN8';
```

### Important: Do Not Leave affiliate_link Empty

An empty `affiliate_link` (`''`) renders `<a href="">` in the browser, which navigates to the current page instead of the product. This is a broken UX.

**For laptops entered before affiliate registration is complete:**
- Use the plain, untagged product URL (e.g., `https://www.mercadolibre.com.ar/MLAxxx-product-name`)
- Update to the tagged URL after registration

**Never leave `affiliate_link` as an empty string in production.**

---

## Checklist

- [ ] Register on MercadoLibre Afiliados (`https://www.mercadolibre.com.ar/l/afiliados`)
- [ ] Receive and activate MercadoLibre confirmation email
- [ ] Register on Amazon Associates US (`https://affiliate-program.amazon.com/`)
- [ ] Note your Amazon Associate Store ID (format: `yourname-20`)
- [ ] Generate affiliate-tagged URL for each MercadoLibre laptop in the catalog
- [ ] Generate affiliate-tagged URL for each Amazon laptop in the catalog
- [ ] Update `affiliate_link` in Supabase for all laptops (use SQL Editor or Table Editor)
- [ ] Test: open a laptop detail overlay in the app, click "Comprar Ahora", verify it navigates to the correct product page with your affiliate tag
