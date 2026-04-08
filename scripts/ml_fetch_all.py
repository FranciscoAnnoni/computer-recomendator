#!/usr/bin/env python3
"""
ml_fetch_all.py
Fetches all laptops from MercadoLibre Argentina, grouped by brand,
deduplicated by catalog product (best seller per model).

Output:
  ml_data/all_laptops.json   — full data grouped by brand
  ml_data/links.txt          — one permalink per line, for affiliate replacement
  ml_data/{brand}.json       — per-brand files

No API credentials needed.

Usage:
  python3 scripts/ml_fetch_all.py
  python3 scripts/ml_fetch_all.py --per-brand 40 --out-dir ml_data
"""

import json
import os
import sys
import time
import argparse
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from datetime import datetime

ML_API = "https://api.mercadolibre.com"
SITE   = "MLA"
CAT    = "MLA1652"  # Notebooks / Laptops Argentina

_token: str = ""   # set by main()


def load_env(path=".env.local") -> dict:
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env


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
        print(f"✓ Token OK (user_id={data.get('user_id')})", file=sys.stderr)
        return token

# ─── Brand search queries ─────────────────────────────────────────────────────
# (search_query, canonical_brand, brand_attr_filter)
# brand_attr_filter: string to match against BRAND attribute (None = no filter)
BRAND_SEARCHES = [
    # ── Lenovo family ────────────────────────────────────────────────────────
    ("thinkpad",              "Lenovo",    "Lenovo"),
    ("lenovo thinkbook",      "Lenovo",    "Lenovo"),
    ("lenovo ideapad",        "Lenovo",    "Lenovo"),
    ("lenovo legion",         "Lenovo",    "Lenovo"),
    ("lenovo yoga",           "Lenovo",    "Lenovo"),
    ("lenovo loq",            "Lenovo",    "Lenovo"),
    # ── HP family ────────────────────────────────────────────────────────────
    ("hp notebook",           "HP",        "HP"),
    ("hp omen",               "HP",        "HP"),
    ("hp victus",             "HP",        "HP"),
    ("hp elitebook",          "HP",        "HP"),
    ("hp pavilion",           "HP",        "HP"),
    ("hp probook",            "HP",        "HP"),
    # ── Dell family ──────────────────────────────────────────────────────────
    ("dell inspiron",         "Dell",      "Dell"),
    ("dell xps",              "Dell",      "Dell"),
    ("dell vostro",           "Dell",      "Dell"),
    ("dell latitude",         "Dell",      "Dell"),
    ("alienware",             "Dell",      "Alienware"),
    # ── Asus family ──────────────────────────────────────────────────────────
    ("asus rog",              "Asus",      "ASUS"),
    ("asus tuf gaming",       "Asus",      "ASUS"),
    ("asus zenbook",          "Asus",      "ASUS"),
    ("asus vivobook",         "Asus",      "ASUS"),
    ("asus proart",           "Asus",      "ASUS"),
    # ── Acer family ──────────────────────────────────────────────────────────
    ("acer predator",         "Acer",      "Acer"),
    ("acer nitro",            "Acer",      "Acer"),
    ("acer aspire",           "Acer",      "Acer"),
    ("acer swift",            "Acer",      "Acer"),
    ("acer extensa",          "Acer",      "Acer"),
    # ── Apple ────────────────────────────────────────────────────────────────
    ("macbook air",           "Apple",     "Apple"),
    ("macbook pro",           "Apple",     "Apple"),
    # ── Samsung ──────────────────────────────────────────────────────────────
    ("samsung galaxy book",   "Samsung",   "Samsung"),
    # ── MSI ──────────────────────────────────────────────────────────────────
    ("msi gaming",            "MSI",       "MSI"),
    ("msi creator",           "MSI",       "MSI"),
    ("msi stealth",           "MSI",       "MSI"),
    ("msi prestige",          "MSI",       "MSI"),
    # ── Huawei ───────────────────────────────────────────────────────────────
    ("huawei matebook",       "Huawei",    "HUAWEI"),
    # ── LG ───────────────────────────────────────────────────────────────────
    ("lg gram",               "LG",        "LG"),
    # ── Microsoft Surface ────────────────────────────────────────────────────
    ("surface laptop",        "Microsoft", "Microsoft"),
    ("surface pro",           "Microsoft", "Microsoft"),
    # ── Gigabyte ─────────────────────────────────────────────────────────────
    ("gigabyte aorus",        "Gigabyte",  "Gigabyte"),
    # ── Razer ────────────────────────────────────────────────────────────────
    ("razer blade",           "Razer",     "Razer"),
    # ── Xiaomi / Redmi ───────────────────────────────────────────────────────
    ("xiaomi notebook",       "Xiaomi",    "Xiaomi"),
    ("redmibook",             "Xiaomi",    "Xiaomi"),
    # ── Toshiba / Dynabook ───────────────────────────────────────────────────
    ("toshiba dynabook",      "Toshiba",   "Toshiba"),
    # ── Argentine / LatAm brands ─────────────────────────────────────────────
    ("exo notebook",          "EXO",       None),   # Argentine brand, no strict filter
    ("bgh notebook",          "BGH",       None),
    ("positivo notebook",     "Positivo",  None),
    ("noblex notebook",       "Noblex",    None),
]


# ─── HTTP helper ─────────────────────────────────────────────────────────────

def fetch(url: str, retries: int = 4):
    global _token
    for attempt in range(retries):
        try:
            headers = {"Accept": "application/json"}
            if _token:
                headers["Authorization"] = f"Bearer {_token}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 6 + attempt * 3
                print(f"  [rate-limit] waiting {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


# ─── Search listings ──────────────────────────────────────────────────────────

def search_catalog_products(query: str, brand_attr: str, limit: int) -> list:
    """
    Search ML catalog products via /products/search.
    Returns catalog products with id, name, attributes, pictures.
    Permalink: https://www.mercadolibre.com.ar/p/{id}
    """
    results = []
    page_size = 50
    offset = 0

    while len(results) < limit:
        batch = min(page_size, limit * 3)  # fetch extra to compensate for brand filter
        url = (
            f"{ML_API}/products/search"
            f"?site_id={SITE}&domain_id=MLA-NOTEBOOKS"
            f"&q={urllib.parse.quote(query)}&status=active"
            f"&limit={batch}&offset={offset}"
        )
        try:
            data = fetch(url)
            page = data.get("results", [])
            paging = data.get("paging", {})
            if not page:
                break
            for p in page:
                if len(results) >= limit:
                    break
                # Filter by brand attribute if provided
                if brand_attr:
                    bval = _get_attr(p.get("attributes", []), "BRAND")
                    if not bval or brand_attr.lower() not in bval.lower():
                        continue
                results.append(p)
            total = paging.get("total", 0)
            offset += len(page)
            if offset >= total or len(page) < batch:
                break
            time.sleep(0.3)
        except Exception as e:
            print(f"  [search error: {e}]", file=sys.stderr)
            break

    return results[:limit]


def _get_attr(attributes: list, *ids: str):
    for aid in ids:
        for a in attributes:
            if a.get("id") == aid:
                v = a.get("value_name")
                if v:
                    return v
    return None


# ─── Spec extraction ──────────────────────────────────────────────────────────

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


def extract_brand_from_attr(attributes: list):
    return attr(attributes, "BRAND")


def infer_tags(title: str, specs: dict) -> list:
    text = (title + " " + " ".join(str(v) for v in specs.values() if v)).lower()
    tags = []
    if "oled" in text:                                               tags.append("Pantalla OLED")
    if any(k in text for k in ["16 gb", "16gb", "32gb", "64gb"]):   tags.append("16GB+ RAM")
    if "ssd" in text or "nvme" in text:                              tags.append("SSD rápido")
    if any(k in text for k in ["ryzen 7","i7","i9","m3","m4","ultra 7","core 7","ryzen 9"]):
                                                                      tags.append("Alto rendimiento")
    if any(k in text for k in ["144hz","165hz","240hz","360hz"]):    tags.append("Alta frecuencia")
    if any(k in text for k in ["rtx 40","rtx 4","rtx 30","rtx 3","rx 7","rx 6"]):
                                                                      tags.append("GPU dedicada")
    if any(k in text for k in ["gaming","rog","tuf","nitro","legion","katana","predator","omen","victus"]):
                                                                      tags.append("Gaming")
    if "macbook" in text or "macos" in text:                         tags.append("macOS")
    if "ultrabook" in text or "slim" in text or "ultra slim" in text: tags.append("Ultradelgado")
    return tags[:4] if tags else ["Uso general"]


def infer_profiles(title: str, specs: dict) -> list:
    text = (title + " " + " ".join(str(v) for v in specs.values() if v)).lower()
    profiles = []
    if any(k in text for k in ["gaming","rog","tuf","nitro","legion","predator","rtx","gtx","omen","victus","alienware"]):
        profiles.append("gaming_rendimiento")
    if any(k in text for k in ["oled","creator","studio","pro","xps","macbook","spectre","zenbook","thinkpad","matebook"]):
        profiles.append("creacion_desarrollo")
    if not profiles:
        profiles.append("productividad_estudio")
    return profiles


# ─── Build entry ──────────────────────────────────────────────────────────────

def build_entry(product: dict, canonical_brand: str) -> dict:
    """Build a laptop entry from a catalog product (products/search result)."""
    attrs    = product.get("attributes", [])
    specs    = extract_specs(attrs)
    title    = product.get("name", "")
    prod_id  = product.get("id", "")

    # Catalog page URL — the correct affiliate link target on ML Argentina
    permalink = f"https://www.mercadolibre.com.ar/p/{prod_id}"

    pics      = product.get("pictures", [])
    thumbnail = pics[0].get("url", "").replace("-I.jpg", "-O.jpg") if pics else ""

    tags     = infer_tags(title, specs)
    profiles = infer_profiles(title, specs)

    return {
        "catalog_product_id":   prod_id,
        "name":                 title[:120],
        "brand":                canonical_brand,
        "price":                None,           # not available from catalog; fill manually or from listing
        "cpu":                  specs["cpu"]     or "Ver descripción",
        "ram":                  specs["ram"]     or "Ver descripción",
        "gpu":                  specs["gpu"]     or "Integrada",
        "storage":              specs["storage"] or "Ver descripción",
        "os":                   specs["os"]      or ("macOS" if canonical_brand == "Apple" else "Windows 11"),
        "screen_size":          specs["screen_size"],
        "weight":               specs["weight"],
        "color":                specs["color"],
        "battery":              None,
        "simplified_tags":      tags,
        "usage_profiles":       profiles,
        "recommendation_score": 7,
        "image_url":            thumbnail,
        "permalink":            permalink,   # ← visit URL → generate affiliate link → paste below
        "affiliate_link":       "",
        "influencer_note":      "",
        "description":          "",
        "gallery_images":       [],
    }


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    global _token

    parser = argparse.ArgumentParser()
    parser.add_argument("--client-id", default=None)
    parser.add_argument("--secret",    default=None)
    parser.add_argument("--per-brand", type=int, default=30, help="Max listings per search query (default: 30)")
    parser.add_argument("--out-dir",   default="ml_data",    help="Output directory (default: ml_data)")
    parser.add_argument("--queries",   default="",           help="Comma-separated query keys to run (default: all)")
    args = parser.parse_args()

    # Load credentials from env or .env.local
    env = load_env()
    client_id = args.client_id or os.environ.get("ML_CLIENT_ID") or env.get("ML_CLIENT_ID")
    secret    = args.secret    or os.environ.get("ML_SECRET")    or env.get("ML_SECRET")

    if client_id and secret:
        _token = get_token(client_id, secret)
    else:
        print("Warning: no ML_CLIENT_ID/ML_SECRET found. API may return 403.", file=sys.stderr)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(exist_ok=True)

    selected_queries = (
        [q.strip() for q in args.queries.split(",") if q.strip()]
        if args.queries else None
    )

    # brand → list of deduplicated laptop entries
    brand_map: dict[str, dict] = {}  # catalog_product_id → entry (keeps best seller)
    brand_entries: dict[str, list] = {}

    total_fetched = 0
    total_deduped = 0

    for query, canonical_brand, brand_attr in BRAND_SEARCHES:
        if selected_queries and not any(q in query for q in selected_queries):
            continue

        print(f"\n{'─'*60}", file=sys.stderr)
        print(f"[{canonical_brand}] q='{query}' limit={args.per_brand}", file=sys.stderr)

        products = search_catalog_products(query, brand_attr or "", args.per_brand)
        print(f"  → {len(products)} catalog products found", file=sys.stderr)

        if not products:
            continue

        total_fetched += len(products)

        for product in products:
            entry = build_entry(product, canonical_brand)
            key   = entry["catalog_product_id"]

            # Dedup: skip if we already have this catalog product
            if key and key in brand_map:
                continue

            brand_map[key] = entry
            print(f"  {key}  {entry['name'][:60]}", file=sys.stderr)

        time.sleep(0.4)

    # ── Group by brand ────────────────────────────────────────────────────────
    for entry in brand_map.values():
        b = entry["brand"]
        brand_entries.setdefault(b, [])
        brand_entries[b].append(entry)

    # Sort each brand by sold_quantity desc
    for b in brand_entries:
        brand_entries[b].sort(key=lambda x: x.get("sold_quantity") or 0, reverse=True)

    total_deduped = sum(len(v) for v in brand_entries.values())

    # ── Save per-brand JSON files ─────────────────────────────────────────────
    for brand, entries in sorted(brand_entries.items()):
        filename = brand.lower().replace(" ", "_") + ".json"
        payload = {
            "brand":        brand,
            "generated_at": datetime.now().isoformat(),
            "source":       f"MercadoLibre Argentina — listings sorted by sold_quantity_desc",
            "total":        len(entries),
            "laptops":      entries,
        }
        out_file = out_dir / filename
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {brand:<15} {len(entries):>3} laptops → {out_file}", file=sys.stderr)

    # ── Save combined all_laptops.json ────────────────────────────────────────
    all_payload = {
        "generated_at": datetime.now().isoformat(),
        "source":       "MercadoLibre Argentina",
        "total":        total_deduped,
        "brands":       sorted(brand_entries.keys()),
        "laptops_by_brand": {
            b: brand_entries[b] for b in sorted(brand_entries.keys())
        },
    }
    all_file = out_dir / "all_laptops.json"
    with open(all_file, "w", encoding="utf-8") as f:
        json.dump(all_payload, f, ensure_ascii=False, indent=2)

    # ── Save links.txt ────────────────────────────────────────────────────────
    links_file = out_dir / "links.txt"
    with open(links_file, "w", encoding="utf-8") as f:
        f.write(f"# MercadoLibre Argentina — Laptop Permalinks\n")
        f.write(f"# Generated: {datetime.now().isoformat()}\n")
        f.write(f"# Total: {total_deduped} unique listings\n")
        f.write(f"# Replace each URL with your affiliate/referral link\n\n")

        for brand in sorted(brand_entries.keys()):
            f.write(f"\n# ── {brand} ({len(brand_entries[brand])} listings) ──\n")
            for entry in brand_entries[brand]:
                sold = f"sold:{entry['sold_quantity']}" if entry.get("sold_quantity") else "sold:?"
                price = f"${entry['price']:,.0f}" if entry.get("price") else "price:?"
                f.write(f"# {entry['name'][:70]} | {sold} | {price}\n")
                f.write(f"{entry['permalink']}\n")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'═'*60}", file=sys.stderr)
    print(f"DONE", file=sys.stderr)
    print(f"  Fetched:    {total_fetched} raw listings", file=sys.stderr)
    print(f"  Unique:     {total_deduped} after dedup (best seller per model)", file=sys.stderr)
    print(f"  Brands:     {len(brand_entries)}", file=sys.stderr)
    print(f"\nFiles:", file=sys.stderr)
    print(f"  {all_file}", file=sys.stderr)
    print(f"  {links_file}  ← open this to see all URLs", file=sys.stderr)
    print(f"\nNext:", file=sys.stderr)
    print(f"  1. Open ml_data/links.txt", file=sys.stderr)
    print(f"  2. Visit each permalink → generate your affiliate link", file=sys.stderr)
    print(f"  3. Fill 'affiliate_link' in each brand JSON", file=sys.stderr)
    print(f"  4. Run: python3 scripts/ml_import_db.py --dir {args.out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
