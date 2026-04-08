#!/usr/bin/env python3
"""
ml_fetch_active.py
==================
Fetches ACTIVE laptop listings from MercadoLibre Argentina.

Strategy (no /sites/MLA/search — that endpoint is blocked for client_credentials):
  1. /highlights/MLA/category/MLA1652  → top 20 best-seller catalog product IDs
  2. /products/search per brand         → up to LIMIT products per brand
  3. /products/{id}/items               → validate active, get real price & listing type
  4. Quality filter: listing_type_id in [gold_pro, gold_special, gold_premium]
  5. /users/{seller_id}                 → seller reputation check (optional, for scoring)
  6. /products/{id}                     → specs, images, description

Output:
  ml_data_active/{brand}.json           one file per brand
  ml_data_active/all_laptops.json       combined
  ml_data_active/links_with_prices.txt  human-readable summary

Usage:
  python3 scripts/ml_fetch_active.py
  python3 scripts/ml_fetch_active.py --per-brand 40 --out-dir ml_data_active
  python3 scripts/ml_fetch_active.py --brands lenovo,hp,apple
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
from collections import defaultdict
from typing import Optional

ML_API = "https://api.mercadolibre.com"
SITE   = "MLA"

_token: str = ""


# ── Listing quality tiers ──────────────────────────────────────────────────────
# Only keep listings from these tiers (platinum/gold sellers on ML)
QUALITY_LISTING_TYPES = {"gold_pro", "gold_special", "gold_premium"}
LISTING_PRIORITY = {
    "gold_pro":     5,   # MercadoLider Platinum
    "gold_special": 4,   # MercadoLider Gold
    "gold_premium": 3,   # MercadoLider
    "gold":         2,
    "silver":       1,
}

# ── Brand search queries ───────────────────────────────────────────────────────
BRAND_SEARCHES = [
    # query                 canonical_brand   brand_attr_filter
    ("lenovo thinkpad",      "Lenovo",         "Lenovo"),
    ("lenovo ideapad",       "Lenovo",         "Lenovo"),
    ("lenovo legion",        "Lenovo",         "Lenovo"),
    ("lenovo yoga",          "Lenovo",         "Lenovo"),
    ("lenovo loq",           "Lenovo",         "Lenovo"),
    ("hp notebook",          "HP",             "HP"),
    ("hp omen",              "HP",             "HP"),
    ("hp victus",            "HP",             "HP"),
    ("hp elitebook",         "HP",             "HP"),
    ("hp pavilion",          "HP",             "HP"),
    ("dell inspiron",        "Dell",           "Dell"),
    ("dell xps",             "Dell",           "Dell"),
    ("dell vostro",          "Dell",           "Dell"),
    ("alienware",            "Dell",           "Alienware"),
    ("asus rog",             "Asus",           "ASUS"),
    ("asus tuf gaming",      "Asus",           "ASUS"),
    ("asus zenbook",         "Asus",           "ASUS"),
    ("asus vivobook",        "Asus",           "ASUS"),
    ("acer predator",        "Acer",           "Acer"),
    ("acer nitro",           "Acer",           "Acer"),
    ("acer aspire",          "Acer",           "Acer"),
    ("macbook air",          "Apple",          "Apple"),
    ("macbook pro",          "Apple",          "Apple"),
    ("samsung galaxy book",  "Samsung",        "Samsung"),
    ("msi gaming",           "MSI",            "MSI"),
    ("msi creator",          "MSI",            "MSI"),
    ("huawei matebook",      "Huawei",         "HUAWEI"),
    ("lg gram",              "LG",             "LG"),
    ("surface laptop",       "Microsoft",      "Microsoft"),
    ("surface pro",          "Microsoft",      "Microsoft"),
    ("gigabyte aorus",       "Gigabyte",       "Gigabyte"),
    ("razer blade",          "Razer",          "Razer"),
    ("exo notebook",         "EXO",            None),
    ("bgh notebook",         "BGH",            None),
    ("positivo notebook",    "Positivo",       None),
    ("noblex notebook",      "Noblex",         None),
]


# ── Auth ──────────────────────────────────────────────────────────────────────

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


# ── HTTP helper ───────────────────────────────────────────────────────────────

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
                wait = 8 + attempt * 4
                print(f"  [rate-limit] {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            if e.code == 404:
                return None   # no active listings for this product
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


# ── Step 1: Get best-seller product IDs from highlights ───────────────────────

def get_highlights(limit: int = 20) -> list[str]:
    """Returns catalog product IDs ranked as best sellers in the category."""
    url = f"{ML_API}/highlights/{SITE}/category/MLA1652?limit={limit}"
    data = fetch(url)
    if not data:
        return []
    return [item["id"] for item in data.get("content", [])]


# ── Step 2: Search catalog products per brand ─────────────────────────────────

def search_catalog_products(query: str, brand_attr: str, limit: int) -> list:
    results = []
    page_size = 50
    offset = 0

    while len(results) < limit:
        batch = min(page_size, limit * 3)
        url = (
            f"{ML_API}/products/search"
            f"?site_id={SITE}&domain_id=MLA-NOTEBOOKS"
            f"&q={urllib.parse.quote(query)}&status=active"
            f"&limit={batch}&offset={offset}"
        )
        try:
            data = fetch(url)
            page = data.get("results", []) if data else []
            paging = (data or {}).get("paging", {})
            if not page:
                break
            for p in page:
                if len(results) >= limit:
                    break
                if brand_attr:
                    bval = _get_attr(p.get("attributes", []), "BRAND")
                    if not bval or brand_attr.lower() not in bval.lower():
                        continue
                results.append(p)
            total  = paging.get("total", 0)
            offset += len(page)
            if offset >= total or len(page) < batch:
                break
            time.sleep(0.3)
        except Exception as e:
            print(f"  [search error: {e}]", file=sys.stderr)
            break

    return results[:limit]


# ── Step 3: Get active items for a catalog product ────────────────────────────

def get_best_item(catalog_product_id: str) -> Optional[dict]:
    """
    Fetches items for a catalog product and returns the best listing:
      - Must be in QUALITY_LISTING_TYPES
      - Prefer local listings over international (international only as fallback)
      - Prefer gold_pro > gold_special > gold_premium
      - Among same tier: prefer lowest price
    Returns None if no quality listing found (product inactive/low quality).
    """
    url = f"{ML_API}/products/{catalog_product_id}/items?limit=20"
    data = fetch(url)
    if not data or not data.get("results"):
        return None

    all_results = data["results"]

    def sort_key(x):
        return (
            -LISTING_PRIORITY.get(x.get("listing_type_id", ""), 0),
            x.get("price", 9_999_999),
        )

    # 1. Try local quality listings first
    local_quality = [
        item for item in all_results
        if item.get("listing_type_id") in QUALITY_LISTING_TYPES
        and item.get("international_delivery_mode", "none") == "none"
    ]
    if local_quality:
        local_quality.sort(key=sort_key)
        return local_quality[0]

    # 2. Fallback: international quality listings (only if no local option exists)
    intl_quality = [
        item for item in all_results
        if item.get("listing_type_id") in QUALITY_LISTING_TYPES
        and item.get("international_delivery_mode", "none") != "none"
    ]
    if intl_quality:
        intl_quality.sort(key=sort_key)
        return intl_quality[0]

    return None


# ── Step 4: Fetch product details (specs, images, description) ────────────────

def get_product_details(catalog_product_id: str) -> dict:
    """Fetches full product detail: name, attributes, pictures, description."""
    url = f"{ML_API}/products/{catalog_product_id}"
    data = fetch(url)
    return data or {}


# ── Step 5: Fetch seller reputation ───────────────────────────────────────────

# Cache to avoid fetching same seller twice
_seller_cache: dict[int, dict] = {}


def get_seller_info(seller_id: int) -> dict:
    """Returns seller reputation info. Cached to avoid duplicate API calls."""
    if seller_id in _seller_cache:
        return _seller_cache[seller_id]
    url = f"{ML_API}/users/{seller_id}"
    try:
        data = fetch(url)
        info = {
            "nickname":          (data or {}).get("nickname", ""),
            "power_seller":      (data or {}).get("seller_reputation", {}).get("power_seller_status"),
            "level_id":          (data or {}).get("seller_reputation", {}).get("level_id"),
            "total_transactions": (data or {}).get("seller_reputation", {}).get("transactions", {}).get("total") or 0,
        }
    except Exception:
        info = {"nickname": "", "power_seller": None, "level_id": None, "total_transactions": 0}
    _seller_cache[seller_id] = info
    return info


# ── Spec & tag helpers ────────────────────────────────────────────────────────

def _get_attr(attributes: list, *ids: str):
    for aid in ids:
        for a in attributes:
            if a.get("id") == aid:
                v = a.get("value_name")
                if v:
                    return v
    return None


def extract_specs(attributes: list) -> dict:
    return {
        "cpu":         _get_attr(attributes, "PROCESSOR_MODEL", "PROCESSOR_BRAND"),
        "ram":         _get_attr(attributes, "RAM_MEMORY_MODULE_TOTAL_CAPACITY", "RAM"),
        "storage":     _get_attr(attributes, "INTERNAL_MEMORY", "SSD_CAPACITY", "SSD_DATA_STORAGE_CAPACITY", "HARD_DRIVE_CAPACITY"),
        "gpu":         _get_attr(attributes, "GPU_MODEL", "VIDEO_RAM"),
        "screen_size": _get_attr(attributes, "DISPLAY_SIZE", "SCREEN_SIZE"),
        "os":          _get_attr(attributes, "OPERATING_SYSTEM"),
        "weight":      _get_attr(attributes, "ITEM_WEIGHT", "WEIGHT"),
        "color":       _get_attr(attributes, "COLOR"),
    }


def infer_tags(title: str, specs: dict) -> list:
    text = (title + " " + " ".join(str(v) for v in specs.values() if v)).lower()
    tags = []
    if "oled" in text:                                                  tags.append("Pantalla OLED")
    if any(k in text for k in ["16 gb", "16gb", "32gb", "64gb"]):      tags.append("16GB+ RAM")
    if "ssd" in text or "nvme" in text:                                 tags.append("SSD rápido")
    if any(k in text for k in ["ryzen 7","i7","i9","m3","m4","ultra 7","core 7","ryzen 9"]):
                                                                        tags.append("Alto rendimiento")
    if any(k in text for k in ["144hz","165hz","240hz","360hz"]):       tags.append("Alta frecuencia")
    if any(k in text for k in ["rtx 40","rtx 4","rtx 30","rtx 3","rx 7","rx 6"]):
                                                                        tags.append("GPU dedicada")
    if any(k in text for k in ["gaming","rog","tuf","nitro","legion","katana","predator","omen","victus"]):
                                                                        tags.append("Gaming")
    if "macbook" in text or "macos" in text:                            tags.append("macOS")
    if any(k in text for k in ["ultrabook","slim","ultra slim"]):       tags.append("Ultradelgado")
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


def infer_score(price, specs: dict, listing_type: str) -> int:
    score = 5
    if price:
        if price > 3_000_000:  score += 2
        elif price > 1_500_000: score += 1
    text = " ".join(str(v) for v in specs.values() if v).lower()
    if any(k in text for k in ["ryzen 7","i7","i9","m3","m4","ultra 7"]): score += 1
    if any(k in text for k in ["16gb","16 gb","32gb"]): score += 1
    if listing_type == "gold_pro": score += 1
    return min(score, 10)


def get_description(product: dict, specs: dict, brand: str) -> str:
    """Get description from product, or auto-generate from specs."""
    sd = product.get("short_description")
    if sd:
        content = sd.get("content", "")
        if content and len(content) > 30:
            # trim to ~500 chars at sentence boundary
            if len(content) > 500:
                cut = content[:500].rfind(".")
                content = content[:cut + 1] if cut > 200 else content[:500].rstrip() + "..."
            return content.strip()

    # Auto-generate from specs
    name = product.get("name", "")
    parts = []
    if specs.get("cpu"):     parts.append(f"Procesador {specs['cpu']}")
    if specs.get("ram"):     parts.append(f"{specs['ram']} de RAM")
    if specs.get("storage"): parts.append(f"almacenamiento {specs['storage']}")
    if specs.get("gpu") and specs["gpu"] != "Integrada": parts.append(f"GPU {specs['gpu']}")
    if specs.get("screen_size"): parts.append(f"pantalla {specs['screen_size']}")
    if specs.get("os"):      parts.append(specs["os"])
    if parts:
        return f"Notebook {brand}. " + ". ".join(parts) + "."
    return ""


# ── Build final entry ─────────────────────────────────────────────────────────

def build_entry(
    product: dict,
    best_item: dict,
    seller_info: dict,
    canonical_brand: str,
    highlight_rank: Optional[int] = None,
) -> dict:
    attrs        = product.get("attributes", [])
    specs        = extract_specs(attrs)
    title        = product.get("name", "")
    prod_id      = product.get("id") or product.get("catalog_product_id", "")

    price        = int(best_item.get("price", 0)) if best_item.get("price") else None
    listing_type = best_item.get("listing_type_id", "")
    item_id      = best_item.get("item_id", "")
    original_price = best_item.get("original_price")
    is_international = best_item.get("international_delivery_mode", "none") != "none"

    pics         = product.get("pictures", [])
    gallery      = [p.get("url", "").replace("-I.jpg", "-O.jpg") for p in pics if p.get("url")]
    thumbnail    = gallery[0] if gallery else ""

    permalink    = product.get("permalink") or f"https://www.mercadolibre.com.ar/p/{prod_id}"

    tags         = infer_tags(title, specs)
    profiles     = infer_profiles(title, specs)
    score        = infer_score(price, specs, listing_type)
    description  = get_description(product, specs, canonical_brand)

    return {
        # ── identifiers ────────────────────────────────────────────────
        "catalog_product_id":   prod_id,
        "item_id":              item_id,

        # ── listing data ────────────────────────────────────────────────
        "name":                 title[:120],
        "brand":                canonical_brand,
        "price":                price,
        "original_price":       int(original_price) if original_price else None,

        # ── specs ───────────────────────────────────────────────────────
        "cpu":                  specs["cpu"]     or "Ver descripción",
        "ram":                  specs["ram"]     or "Ver descripción",
        "gpu":                  specs["gpu"]     or "Integrada",
        "storage":              specs["storage"] or "Ver descripción",
        "os":                   specs["os"]      or ("macOS" if canonical_brand == "Apple" else "Windows 11"),
        "screen_size":          specs["screen_size"],
        "weight":               specs["weight"],
        "color":                specs["color"],
        "battery":              None,

        # ── quality signals ─────────────────────────────────────────────
        "listing_type":         listing_type,
        "international_delivery": is_international,
        "seller_nickname":      seller_info.get("nickname", ""),
        "seller_power_status":  seller_info.get("power_seller"),
        "seller_level":         seller_info.get("level_id"),
        "seller_transactions":  seller_info.get("total_transactions", 0),
        "highlight_rank":       highlight_rank,

        # ── UI data ─────────────────────────────────────────────────────
        "simplified_tags":      tags,
        "usage_profiles":       profiles,
        "recommendation_score": score,
        "description":          description,
        "image_url":            thumbnail,
        "gallery_images":       gallery[1:5],
        "permalink":            permalink,
        "affiliate_link":       "",
        "influencer_note":      "",
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    global _token

    parser = argparse.ArgumentParser(description="Fetch active ML laptop listings with prices")
    parser.add_argument("--client-id",  default=None)
    parser.add_argument("--secret",     default=None)
    parser.add_argument("--per-brand",  type=int, default=40,
                        help="Catalog products to query per brand (default: 40). "
                             "Many will be skipped if inactive. Expect ~20-50%% yield.")
    parser.add_argument("--out-dir",    default="ml_data_active")
    parser.add_argument("--brands",     default="",
                        help="Comma-separated canonical brand names to run (default: all)")
    parser.add_argument("--no-highlights", action="store_true",
                        help="Skip the highlights step")
    parser.add_argument("--skip-seller-check", action="store_true",
                        help="Skip /users/{id} calls to save time (listing_type filter still applies)")
    args = parser.parse_args()

    env       = load_env()
    client_id = args.client_id or os.environ.get("ML_CLIENT_ID") or env.get("ML_CLIENT_ID")
    secret    = args.secret    or os.environ.get("ML_SECRET")    or env.get("ML_SECRET")

    if not client_id or not secret:
        print("Error: ML_CLIENT_ID and ML_SECRET required", file=sys.stderr)
        sys.exit(1)

    _token = get_token(client_id, secret)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(exist_ok=True)

    selected_brands = (
        {b.strip() for b in args.brands.split(",") if b.strip()}
        if args.brands else None
    )

    # catalog_product_id → entry (dedup)
    all_entries: dict[str, dict] = {}

    # ── Step A: Highlights (best-sellers across all brands) ────────────────────
    if not args.no_highlights:
        print(f"\n{'═'*60}", file=sys.stderr)
        print("STEP A: Fetching best-seller highlights...", file=sys.stderr)
        highlight_ids = get_highlights(limit=20)
        print(f"  → {len(highlight_ids)} highlighted products", file=sys.stderr)

        for rank, pid in enumerate(highlight_ids, start=1):
            if pid in all_entries:
                continue
            try:
                product  = get_product_details(pid)
                if not product:
                    continue

                # Determine brand from attributes
                attrs = product.get("attributes", [])
                brand_val = _get_attr(attrs, "BRAND") or ""
                canonical = brand_val or "Other"

                if selected_brands and canonical not in selected_brands:
                    continue

                best_item = get_best_item(pid)
                if not best_item:
                    print(f"  [{rank:>2}] {pid} — no quality listing, skip", file=sys.stderr)
                    time.sleep(0.2)
                    continue

                seller_info = {}
                if not args.skip_seller_check:
                    seller_info = get_seller_info(best_item.get("seller_id", 0))
                    time.sleep(0.15)

                entry = build_entry(product, best_item, seller_info, canonical, highlight_rank=rank)
                all_entries[pid] = entry
                print(
                    f"  [{rank:>2}] {pid}  ${entry['price']:>12,.0f}  "
                    f"{entry['listing_type']:<12}  {entry['name'][:45]}",
                    file=sys.stderr,
                )
                time.sleep(0.25)

            except Exception as e:
                print(f"  [{rank}] {pid} error: {e}", file=sys.stderr)
                time.sleep(0.5)

    # ── Step B: Per-brand search ────────────────────────────────────────────────
    print(f"\n{'═'*60}", file=sys.stderr)
    print("STEP B: Per-brand product search...", file=sys.stderr)

    brand_seen: dict[str, set] = defaultdict(set)  # brand → set of product IDs already seen

    for query, canonical_brand, brand_attr in BRAND_SEARCHES:
        if selected_brands and canonical_brand not in selected_brands:
            continue

        print(f"\n{'─'*60}", file=sys.stderr)
        print(f"[{canonical_brand}] q='{query}' (limit={args.per_brand})", file=sys.stderr)

        products = search_catalog_products(query, brand_attr or "", args.per_brand)
        print(f"  → {len(products)} catalog products found", file=sys.stderr)

        found_active = 0
        found_quality = 0

        for product in products:
            pid = product.get("id", "")
            if not pid or pid in all_entries or pid in brand_seen[canonical_brand]:
                continue
            brand_seen[canonical_brand].add(pid)

            try:
                best_item = get_best_item(pid)
                if not best_item:
                    # 404 or no quality listings — product is inactive/low quality
                    time.sleep(0.15)
                    continue

                found_active += 1

                # Fetch full product details (specs + description)
                product_detail = get_product_details(pid)
                time.sleep(0.15)

                seller_info = {}
                if not args.skip_seller_check:
                    seller_info = get_seller_info(best_item.get("seller_id", 0))
                    time.sleep(0.15)

                entry = build_entry(product_detail or product, best_item, seller_info, canonical_brand)
                all_entries[pid] = entry
                found_quality += 1

                print(
                    f"  ✓ {pid}  ${entry['price']:>12,.0f}  "
                    f"{entry['listing_type']:<12}  {entry['name'][:40]}",
                    file=sys.stderr,
                )
                time.sleep(0.2)

            except Exception as e:
                print(f"  ! {pid} error: {e}", file=sys.stderr)
                time.sleep(0.5)

        print(
            f"  Summary: {len(products)} queried → {found_active} active → {found_quality} quality added",
            file=sys.stderr,
        )
        time.sleep(0.4)

    # ── Group by brand ─────────────────────────────────────────────────────────
    brand_entries: dict[str, list] = defaultdict(list)
    for entry in all_entries.values():
        brand_entries[entry["brand"]].append(entry)

    # Sort each brand: highlight rank first, then price desc (more expensive = premium)
    for brand, entries in brand_entries.items():
        entries.sort(
            key=lambda x: (
                x.get("highlight_rank") or 999,
                -(x.get("price") or 0),
            )
        )

    total = sum(len(v) for v in brand_entries.values())

    # ── Save per-brand JSON ────────────────────────────────────────────────────
    for brand, entries in sorted(brand_entries.items()):
        fname = brand.lower().replace(" ", "_") + ".json"
        payload = {
            "brand":        brand,
            "generated_at": datetime.now().isoformat(),
            "source":       "MercadoLibre Argentina — active quality listings",
            "filter":       "listing_type: gold_pro / gold_special / gold_premium",
            "total":        len(entries),
            "laptops":      entries,
        }
        out_file = out_dir / fname
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        with_price = sum(1 for e in entries if e.get("price"))
        print(f"  ✓ {brand:<15} {len(entries):>3} laptops ({with_price} with price) → {out_file}", file=sys.stderr)

    # ── Save combined JSON ─────────────────────────────────────────────────────
    all_payload = {
        "generated_at": datetime.now().isoformat(),
        "source":       "MercadoLibre Argentina",
        "total":        total,
        "brands":       sorted(brand_entries.keys()),
        "laptops_by_brand": {b: brand_entries[b] for b in sorted(brand_entries.keys())},
    }
    all_file = out_dir / "all_laptops.json"
    with open(all_file, "w", encoding="utf-8") as f:
        json.dump(all_payload, f, ensure_ascii=False, indent=2)

    # ── Save links_with_prices.txt ─────────────────────────────────────────────
    links_file = out_dir / "links_with_prices.txt"
    with open(links_file, "w", encoding="utf-8") as f:
        f.write(f"# MercadoLibre Argentina — Laptops Activas con Precios\n")
        f.write(f"# Generado: {datetime.now().isoformat()}\n")
        f.write(f"# Total: {total} laptops únicas (solo listados gold_pro/gold_special/gold_premium)\n\n")

        for brand in sorted(brand_entries.keys()):
            entries = brand_entries[brand]
            with_price = [e for e in entries if e.get("price")]
            f.write(f"\n# ══ {brand} ({len(entries)} laptops, {len(with_price)} con precio) ══\n\n")
            for e in entries:
                price_str = f"${e['price']:,.0f} ARS" if e.get("price") else "precio no disponible"
                seller_str = f"{e.get('seller_nickname', '')} ({e.get('seller_power_status', '?')})"
                f.write(f"# {e['name'][:70]}\n")
                f.write(f"# {price_str}  |  {e.get('listing_type', '?')}  |  {seller_str}\n")
                f.write(f"# CPU: {e.get('cpu','')}  RAM: {e.get('ram','')}  Storage: {e.get('storage','')}\n")
                f.write(f"{e['permalink']}\n\n")

    # ── Summary ────────────────────────────────────────────────────────────────
    print(f"\n{'═'*60}", file=sys.stderr)
    print(f"DONE", file=sys.stderr)
    print(f"  Total unique:  {total} laptops with active quality listings", file=sys.stderr)
    print(f"  Brands:        {len(brand_entries)}", file=sys.stderr)
    with_price = sum(1 for e in all_entries.values() if e.get("price"))
    print(f"  With price:    {with_price} / {total}", file=sys.stderr)
    print(f"\nFiles:", file=sys.stderr)
    print(f"  {all_file}", file=sys.stderr)
    print(f"  {links_file}", file=sys.stderr)
    print(f"\nNext:", file=sys.stderr)
    print(f"  python3 scripts/ml_import_db.py --dir {args.out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
