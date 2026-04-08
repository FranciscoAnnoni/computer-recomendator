#!/usr/bin/env python3
"""
ml_scrape_laptops.py
Fetches laptops from MercadoLibre Argentina by brand and saves one JSON per brand.

Each entry includes:
  - 'permalink'     → ML product page URL (mercadolibre.com.ar/p/{id})
                       Visit this URL and use your affiliate dashboard to generate the referral link
  - 'affiliate_link' → empty field — paste your generated affiliate link here
  - All specs (cpu, ram, storage, gpu, os, screen_size, weight)

Once you fill in 'affiliate_link', run ml_import_db.py to populate the database.

Usage:
  export $(grep ML_ .env.local | xargs)
  python3 scripts/ml_scrape_laptops.py

  python3 scripts/ml_scrape_laptops.py --per-brand 30 --out-dir ml_data

Options:
  --per-brand N      Products per brand (default: 30)
  --out-dir PATH     Output directory (default: ml_data)
  --brands LIST      Comma-separated brands to fetch, e.g. apple,lenovo,hp
                     Default: all brands (apple, lenovo, hp, asus, dell, acer, samsung, msi, huawei, lg, microsoft, gigabyte)
"""

import json
import os
import sys
import time
import argparse
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from pathlib import Path

ML_API = "https://api.mercadolibre.com"
DOMAIN = "MLA-NOTEBOOKS"
SITE   = "MLA"

# brand_key → (search_keyword, canonical_name, brand_attribute_value)
BRANDS = {
    "apple":     ("macbook apple",   "Apple",     "Apple"),
    "lenovo":    ("lenovo",          "Lenovo",    "Lenovo"),
    "hp":        ("hp notebook",     "HP",        "HP"),
    "asus":      ("asus",            "Asus",      "ASUS"),
    "dell":      ("dell",            "Dell",      "Dell"),
    "acer":      ("acer",            "Acer",      "Acer"),
    "samsung":   ("samsung galaxy",  "Samsung",   "Samsung"),
    "msi":       ("msi gaming",      "MSI",       "MSI"),
    "huawei":    ("huawei matebook", "Huawei",    "HUAWEI"),
    "lg":        ("lg gram",         "LG",        "LG"),
    "microsoft": ("surface laptop",  "Microsoft", "Microsoft"),
    "gigabyte":  ("gigabyte aorus",  "Gigabyte",  "Gigabyte"),
}


# ── Auth ──────────────────────────────────────────────────────────────────────

def get_token(client_id: str, secret: str) -> str:
    payload = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": secret,
    }).encode()
    req = urllib.request.Request(
        f"{ML_API}/oauth/token",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
        token = data.get("access_token")
        if not token:
            print(f"Auth error: {data}", file=sys.stderr)
            sys.exit(1)
        print(f"✓ Token OK (user {data.get('user_id')})", file=sys.stderr)
        return token


# ── HTTP helper ───────────────────────────────────────────────────────────────

def fetch(url: str, token: str, retries: int = 3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url,
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(" [rate-limit 5s]", file=sys.stderr, end="", flush=True)
                time.sleep(5)
                continue
            if attempt == retries - 1:
                raise
            time.sleep(1.5 ** attempt)
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 ** attempt)


# ── Product search ────────────────────────────────────────────────────────────

def search_products(keyword: str, brand_attr: str, token: str, limit: int) -> list:
    """
    Fetch active catalog products for a brand.
    Filters by BRAND attribute to avoid cross-brand contamination.
    """
    results = []
    offset  = 0
    page_size = 50

    while len(results) < limit:
        batch = min(page_size, limit * 3)  # fetch extra, we filter after
        url = (
            f"{ML_API}/products/search"
            f"?site_id={SITE}&domain_id={DOMAIN}"
            f"&q={urllib.parse.quote(keyword)}&status=active"
            f"&limit={batch}&offset={offset}"
        )
        try:
            data   = fetch(url, token)
            page   = data.get("results", [])
            paging = data.get("paging", {})

            if not page:
                break

            # Filter to products whose BRAND attribute matches the expected brand
            for p in page:
                if len(results) >= limit:
                    break
                brand_val = _get_attr(p.get("attributes", []), "BRAND")
                if brand_val and brand_attr.lower() in brand_val.lower():
                    results.append(p)

            # Stop if we got all available results
            total     = paging.get("total", 0)
            offset    += len(page)
            if offset >= total or len(page) < batch:
                break

            time.sleep(0.3)

        except Exception as e:
            print(f" [search error: {e}]", file=sys.stderr)
            break

    return results[:limit]


# ── Spec helpers ──────────────────────────────────────────────────────────────

def _get_attr(attributes: list, *ids: str):
    for attr_id in ids:
        for a in attributes:
            if a.get("id") == attr_id:
                v = a.get("value_name")
                if v:
                    return v
    return None


def extract_specs(attributes: list) -> dict:
    return {
        "cpu":         _get_attr(attributes, "PROCESSOR_MODEL", "PROCESSOR_BRAND"),
        "ram":         _get_attr(attributes, "RAM_MEMORY_MODULE_TOTAL_CAPACITY", "RAM"),
        "storage":     _get_attr(attributes, "INTERNAL_MEMORY", "SSD_CAPACITY", "HARD_DRIVE_CAPACITY"),
        "gpu":         _get_attr(attributes, "GPU_MODEL", "VIDEO_RAM"),
        "screen_size": _get_attr(attributes, "DISPLAY_SIZE", "SCREEN_SIZE"),
        "os":          _get_attr(attributes, "OPERATING_SYSTEM"),
        "weight":      _get_attr(attributes, "ITEM_WEIGHT", "WEIGHT"),
        "color":       _get_attr(attributes, "COLOR"),
    }


def infer_tags(title: str, specs: dict) -> list:
    text  = (title + " " + " ".join(str(v) for v in specs.values() if v)).lower()
    tags  = []
    if "oled" in text:                                         tags.append("Pantalla OLED")
    if any(k in text for k in ["16 gb", "16gb", "32gb"]):     tags.append("16GB+ RAM")
    if "ssd" in text or "nvme" in text:                        tags.append("SSD rápido")
    if any(k in text for k in ["ryzen 7","i7","m3","m4","ultra 7","core 7"]): tags.append("Alto rendimiento")
    if any(k in text for k in ["144hz","165hz","240hz"]):      tags.append("Alta frecuencia")
    if any(k in text for k in ["rtx 40","rtx 4","rx 7"]):     tags.append("GPU dedicada potente")
    if any(k in text for k in ["gaming","rog","tuf","nitro","legion","katana"]): tags.append("Gaming")
    if "macbook" in text or "macos" in text:                   tags.append("macOS")
    return (tags[:4] if tags else ["Uso general"])


def infer_profiles(title: str, specs: dict) -> list:
    text     = (title + " " + " ".join(str(v) for v in specs.values() if v)).lower()
    profiles = []
    if any(k in text for k in ["gaming","rog","tuf","nitro","legion","predator","rtx","gtx"]): profiles.append("gaming_rendimiento")
    if any(k in text for k in ["oled","creator","studio","pro","xps","macbook","spectre"])   : profiles.append("creacion_desarrollo")
    if not profiles:                                                                            profiles.append("productividad_estudio")
    return profiles


def infer_score(price) -> int:
    if not price:           return 6
    if price > 2_000_000:  return 9
    if price > 1_200_000:  return 8
    if price > 700_000:    return 7
    return 6


# ── Build entry ───────────────────────────────────────────────────────────────

def build_entry(product: dict, canonical_brand: str) -> dict:
    attrs  = product.get("attributes", [])
    specs  = extract_specs(attrs)
    title  = product.get("name", "")
    prod_id = product.get("id", "")

    # ML product page URL — valid for affiliate link generation
    permalink = f"https://www.mercadolibre.com.ar/p/{prod_id}"

    # Thumbnail from product pictures
    pics      = product.get("pictures", [])
    thumbnail = pics[0].get("url", "").replace("-I.jpg", "-O.jpg") if pics else ""

    tags     = infer_tags(title, specs)
    profiles = infer_profiles(title, specs)

    # Try to get a price hint from the product search result itself
    price = None  # price not available from product catalog, will come from actual listings

    return {
        # ── identifiers ──────────────────────────────────────────────
        "catalog_product_id": prod_id,

        # ── database fields ──────────────────────────────────────────
        "name":                title,
        "brand":               canonical_brand,
        "price":               price,             # fill in manually or leave null
        "cpu":                 specs["cpu"]    or "Ver descripción",
        "ram":                 specs["ram"]    or "Ver descripción",
        "gpu":                 specs["gpu"]    or "Integrada",
        "storage":             specs["storage"] or "Ver descripción",
        "os":                  specs["os"]     or ("macOS" if canonical_brand == "Apple" else "Windows 11"),
        "screen_size":         specs["screen_size"],
        "weight":              specs["weight"],
        "battery":             None,
        "simplified_tags":     tags,
        "usage_profiles":      profiles,
        "influencer_note":     "",
        "recommendation_score": infer_score(price),
        "affiliate_link":      "",      # ← paste your affiliate link here after visiting permalink
        "image_url":           thumbnail,
        "description":         "",
        "gallery_images":      [],

        # ── affiliate workflow ───────────────────────────────────────
        "permalink":           permalink,  # visit this URL → generate affiliate link → paste in affiliate_link
        "color":               specs["color"],
    }


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--client-id", default=os.environ.get("ML_CLIENT_ID"))
    parser.add_argument("--secret",    default=os.environ.get("ML_SECRET"))
    parser.add_argument("--per-brand", type=int, default=30, help="Products per brand (default: 30)")
    parser.add_argument("--out-dir",   default="ml_data", help="Output directory (default: ml_data)")
    parser.add_argument("--brands",    default="", help="Comma-separated brands (default: all)")
    args = parser.parse_args()

    if not args.client_id or not args.secret:
        print("Error: set ML_CLIENT_ID and ML_SECRET", file=sys.stderr)
        print("Run: export $(grep ML_ .env.local | xargs)", file=sys.stderr)
        sys.exit(1)

    token = get_token(args.client_id, args.secret)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(exist_ok=True)

    selected = (
        [b.strip() for b in args.brands.split(",") if b.strip()]
        if args.brands
        else list(BRANDS.keys())
    )

    summary = []

    for brand_key in selected:
        if brand_key not in BRANDS:
            print(f"Unknown brand '{brand_key}'. Valid: {', '.join(BRANDS)}", file=sys.stderr)
            continue

        keyword, canonical, brand_attr = BRANDS[brand_key]
        print(f"\n{'─'*60}", file=sys.stderr)
        print(f"Brand: {canonical}  (q='{keyword}', limit={args.per_brand})", file=sys.stderr)

        products = search_products(keyword, brand_attr, token, limit=args.per_brand)
        print(f"  Found {len(products)} active catalog products", file=sys.stderr)

        laptops = []
        seen    = set()

        for i, product in enumerate(products):
            prod_id = product.get("id", "")
            if prod_id in seen:
                continue
            seen.add(prod_id)

            entry = build_entry(product, canonical)
            laptops.append(entry)
            print(f"  [{i+1:>3}] {prod_id}  {entry['name'][:55]}", file=sys.stderr)

        # Save JSON
        out_file = out_dir / f"{brand_key}.json"
        payload  = {
            "brand":        canonical,
            "generated_at": datetime.now().isoformat(),
            "source":       f"MercadoLibre Argentina — catalog products (q='{keyword}', status=active)",
            "instructions": (
                "For each laptop: 1) visit 'permalink'  2) use your ML affiliate dashboard "
                "to generate your referral URL  3) paste it in 'affiliate_link'  "
                "4) run ml_import_db.py to push to the database"
            ),
            "total":   len(laptops),
            "laptops": laptops,
        }
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        print(f"\n  ✓ {len(laptops)} laptops → {out_file}", file=sys.stderr)
        summary.append((canonical, len(laptops), str(out_file)))

    # Summary
    print(f"\n{'═'*60}", file=sys.stderr)
    print("DONE\n", file=sys.stderr)
    total = 0
    for brand, count, path in summary:
        print(f"  {brand:<15} {count:>3} laptops  →  {path}", file=sys.stderr)
        total += count
    print(f"\n  Total: {total} laptops across {len(summary)} brands", file=sys.stderr)
    print(f"\nNext:", file=sys.stderr)
    print(f"  1. Open ml_data/*.json — for each laptop visit 'permalink' and generate affiliate link", file=sys.stderr)
    print(f"  2. Paste affiliate link in 'affiliate_link' field", file=sys.stderr)
    print(f"  3. Run: python3 scripts/ml_import_db.py --dir {args.out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
