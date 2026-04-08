#!/usr/bin/env python3
"""
ml_scrape_new.py
================
Scrapes specific MercadoLibre products and store catalogs.
Outputs /tmp/new_laptops_scraped.json in ml_data_active format.

Usage:
  python3 scripts/ml_scrape_new.py
  python3 scripts/ml_scrape_new.py --out /tmp/new_laptops.json
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
AFFILIATE_D2ID = "a3e2a9a0-f26e-4b8f-acf6-96f2b4d77f85"

_token = ""

# ── Specific product IDs to fetch ──────────────────────────────────────────────
SPECIFIC_PRODUCTS = [
    "MLA65915109",  # Lenovo IdeaPad Slim 3 Ryzen 7 7735HS 24GB
    "MLA43286413",  # HP 255 G10 Ryzen 7 7730U 16GB
    "MLA63548884",  # HP 255r G10 Ryzen 7 7735U 16GB
    "MLA66170296",  # Gfast N-758R Ryzen 7 5825U 16GB
    "MLA66171107",  # Gfast N-536R Ryzen 5 3500U 16GB
]

# ── Store listing pages (HTML scrape → catalog product IDs → API) ──────────────
# Use the listado (search) URL which shows all products filtered by notebooks
STORE_LISTING_URLS = [
    {
        "name": "PC Center Computers",
        "url": "https://www.mercadolibre.com.ar/tienda/pc-center-computers?category_id=MLA1652",
    },
    {
        "name": "Apple",
        "url": "https://www.mercadolibre.com.ar/tienda/apple?category_id=MLA1652",
    },
    {
        "name": "TuNotebook TechStore",
        "url": "https://www.mercadolibre.com.ar/tienda/tunotebook-techstore?category_id=MLA1652",
    },
    {
        "name": "EXO",
        "url": "https://www.mercadolibre.com.ar/tienda/exo?category_id=MLA1652",
    },
    {
        "name": "Pygcomexarg",
        "url": "https://www.mercadolibre.com.ar/tienda/pygcomexarg?category_id=MLA1652",
    },
]

LAPTOP_CATEGORY = "MLA1652"

# ── Fallback: brand searches via products/search API ──────────────────────────
# Used when HTML store scraping returns 0 results (e.g. Apple uses JS rendering)
BRAND_SEARCHES = [
    {"query": "macbook apple",  "brand_filter": "apple",  "label": "Apple MacBooks",  "limit": 30},
    {"query": "gfast notebook", "brand_filter": "gfast",  "label": "Gfast Notebooks", "limit": 20},
]


# ── Auth ───────────────────────────────────────────────────────────────────────

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
    print(f"✓ Token OK", file=sys.stderr)
    return token


# ── HTTP ───────────────────────────────────────────────────────────────────────

def fetch(url: str, retries: int = 3):
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
                time.sleep(2 ** attempt)
                continue
            if e.code == 404:
                return None
            body = e.read().decode()
            print(f"HTTP {e.code} {url[:80]}: {body[:200]}", file=sys.stderr)
            return None
        except Exception as ex:
            if attempt < retries - 1:
                time.sleep(1)
                continue
            print(f"Error {url[:80]}: {ex}", file=sys.stderr)
            return None
    return None


# ── Attribute helpers ──────────────────────────────────────────────────────────

def attr(attributes: list, *names: str) -> str:
    for name in names:
        for a in attributes:
            if a.get("id", "").lower() == name.lower() or a.get("name", "").lower() == name.lower():
                return a.get("value_name") or ""
    return ""


def classify_laptop(name: str, specs: dict) -> dict:
    """Returns simplified_tags, usage_profiles, recommendation_score."""
    name_lower = name.lower()
    cpu = (specs.get("cpu") or "").lower()
    ram_str = (specs.get("ram") or "").lower()
    price = specs.get("price", 0) or 0
    os_val = (specs.get("os") or "").lower()

    # RAM in GB
    ram_gb = 0
    for part in ram_str.split():
        try:
            ram_gb = int(part)
            break
        except ValueError:
            pass

    tags = []
    profiles = []

    # Gaming detection
    gaming_keywords = ["gaming", "rog", "strix", "tuf", "legion", "omen", "nitro", "predator",
                       "scar", "zephyrus", "rtx", "gtx", "radeon rx", "rx 6", "rx 7"]
    is_gaming = any(k in name_lower for k in gaming_keywords)

    # Creation/dev detection
    creation_keywords = ["macbook pro", "mac pro", "workstation", "creator", "studio"]
    is_creation = any(k in name_lower for k in creation_keywords) or "macos" in os_val

    if is_gaming:
        profiles.append("gaming_rendimiento")
        tags.append("Gaming")
    if is_creation:
        profiles.append("creacion_desarrollo")
        tags.append("Creación")
    if not profiles:
        profiles.append("productividad_estudio")

    if ram_gb >= 32:
        tags.append("32GB+ RAM")
    elif ram_gb >= 16:
        tags.append("16GB RAM")
    elif ram_gb >= 8:
        tags.append("8GB RAM")

    if "ssd" in name_lower or "nvme" in name_lower:
        tags.append("SSD rápido")

    if "macbook" in name_lower or "macos" in os_val:
        tags.append("macOS")

    # Score: 1-10 based on price tier and specs
    if price > 2_000_000:
        score = 9
    elif price > 1_200_000:
        score = 8
    elif price > 700_000:
        score = 7
    elif price > 400_000:
        score = 6
    else:
        score = 5

    if ram_gb >= 16:
        score = min(10, score + 1)

    return {
        "simplified_tags": tags[:4],
        "usage_profiles": list(set(profiles)),
        "recommendation_score": score,
    }


# ── Build laptop record from product data ──────────────────────────────────────

def product_to_laptop(product: dict, item: dict = None) -> dict:
    """Convert ML product + optional item into our laptop schema."""
    attrs = product.get("attributes") or []
    if item:
        attrs = attrs or (item.get("attributes") or [])

    name = product.get("name") or (item.get("title") if item else "") or ""
    price = (item.get("price") if item else None) or product.get("price") or 0
    permalink = product.get("permalink") or (item.get("permalink") if item else "") or ""
    catalog_id = product.get("id") or ""
    item_id = (item.get("id") if item else "") or ""

    # Images
    pictures = product.get("pictures") or (item.get("pictures") if item else []) or []
    images = [p.get("url", "") for p in pictures if p.get("url")]
    image_url = images[0] if images else ""
    gallery = images[1:5] if len(images) > 1 else []

    # OS detection
    os_val = attr(attrs, "OPERATING_SYSTEM") or ""
    if not os_val:
        name_lower = name.lower()
        if "macos" in name_lower or "mac os" in name_lower or "apple" in name_lower.split()[0:1]:
            os_val = "macOS"
        else:
            os_val = "Windows 11"
    if "sequoia" in os_val.lower() or os_val.lower() == "macos":
        os_val = "macOS"

    specs = {
        "cpu": attr(attrs, "PROCESSOR_MODEL", "PROCESSOR") or attr(attrs, "CHIPSET"),
        "ram": attr(attrs, "RAM", "RAM_MEMORY"),
        "gpu": attr(attrs, "GPU_MODEL", "VIDEO_CARD_TYPE") or "Integrada",
        "storage": attr(attrs, "INTERNAL_MEMORY", "HARD_DRIVE_CAPACITY", "SSD_CAPACITY"),
        "os": os_val,
        "screen_size": attr(attrs, "DISPLAY_SIZE", "SCREEN_SIZE"),
        "weight": attr(attrs, "WEIGHT"),
        "battery": attr(attrs, "BATTERY_DURATION", "BATTERY_CAPACITY"),
        "color": attr(attrs, "COLOR"),
        "price": price,
    }

    # Brand
    brand = attr(attrs, "BRAND") or ""
    if not brand:
        for b in ["Lenovo", "HP", "Asus", "Dell", "Apple", "Acer", "MSI", "Samsung",
                  "Gfast", "EXO", "BGH", "Noblex", "Philco", "Huawei", "LG"]:
            if b.lower() in name.lower():
                brand = b
                break

    classification = classify_laptop(name, specs)

    affiliate_link = ""
    if permalink:
        base = permalink.split("?")[0]
        affiliate_link = f"{base}?matt_d2id={AFFILIATE_D2ID}"

    return {
        "catalog_product_id": catalog_id,
        "item_id": item_id,
        "name": name,
        "brand": brand,
        "price": price,
        "original_price": item.get("original_price") if item else None,
        "cpu": specs["cpu"],
        "ram": specs["ram"],
        "gpu": specs["gpu"],
        "storage": specs["storage"],
        "os": specs["os"],
        "screen_size": specs["screen_size"],
        "weight": specs["weight"],
        "color": specs["color"],
        "battery": specs["battery"],
        "simplified_tags": classification["simplified_tags"],
        "usage_profiles": classification["usage_profiles"],
        "recommendation_score": classification["recommendation_score"],
        "description": f"Notebook {brand}. {name}.",
        "image_url": image_url,
        "gallery_images": gallery,
        "permalink": permalink,
        "affiliate_link": affiliate_link,
        "influencer_note": "",
        "availability_warning": False,
    }


# ── Fetch best item for a product ──────────────────────────────────────────────

def fetch_best_item(product_id: str):
    """Get the highest quality active item for a catalog product."""
    data = fetch(f"{ML_API}/products/{product_id}/items?status=active")
    if not data:
        return None
    items = data if isinstance(data, list) else data.get("results", [])
    QUALITY = {"gold_pro": 5, "gold_special": 4, "gold_premium": 3, "gold": 2, "silver": 1}
    best = None
    best_score = -1
    for it in items:
        lt = it.get("listing_type_id", "")
        score = QUALITY.get(lt, 0)
        if score > best_score:
            best_score = score
            best = it
    return best


# ── Fetch specific product IDs ─────────────────────────────────────────────────

def fetch_specific_products(product_ids: list) -> list:
    results = []
    for pid in product_ids:
        print(f"  Fetching product {pid}...", file=sys.stderr)
        product = fetch(f"{ML_API}/products/{pid}")
        if not product:
            print(f"  ✗ {pid} not found", file=sys.stderr)
            continue
        item = fetch_best_item(pid)
        laptop = product_to_laptop(product, item)
        results.append(laptop)
        print(f"  ✓ {laptop['brand']} {laptop['name'][:50]} — ${laptop['price']:,}", file=sys.stderr)
        time.sleep(0.3)
    return results


# ── HTML scrape helpers ────────────────────────────────────────────────────────

def fetch_html(url: str) -> str:
    """Fetch a web page as HTML text."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept-Language": "es-AR,es;q=0.9",
        })
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  HTML fetch error {url[:70]}: {e}", file=sys.stderr)
        return ""


def extract_catalog_ids_from_html(html: str) -> list:
    """
    Extract catalog product IDs (MLA + 7-9 digits) from ML listing HTML.
    Item IDs are 10 digits and can't be accessed directly, so we skip them.
    """
    import re
    # Catalog product IDs: MLA followed by 7-9 digits
    ids = re.findall(r'\bMLA(\d{7,9})\b', html)
    # Deduplicate while preserving order
    seen = set()
    result = []
    for d in ids:
        pid = f"MLA{d}"
        if pid not in seen:
            seen.add(pid)
            result.append(pid)
    return result


def get_total_results_from_html(html: str) -> int:
    """Try to extract total result count from ML listing HTML."""
    import re
    # Look for patterns like "X resultados" or totalResults in JSON
    m = re.search(r'"totalResults"\s*:\s*(\d+)', html)
    if m:
        return int(m.group(1))
    m = re.search(r'"total"\s*:\s*(\d+)', html)
    if m:
        return int(m.group(1))
    return 0


# ── Fetch all laptops from a store via HTML scraping ──────────────────────────

def fetch_store_items(store: dict) -> list:
    """Scrape store homepage for catalog product IDs, then fetch via API."""
    url = store["url"]
    results = []
    seen_ids = set()

    print(f"  Fetching: {url[:80]}...", file=sys.stderr)
    html = fetch_html(url)
    if not html:
        return results

    catalog_ids = extract_catalog_ids_from_html(html)
    print(f"  Found {len(catalog_ids)} catalog IDs", file=sys.stderr)

    for pid in catalog_ids:
        if pid in seen_ids:
            continue
        seen_ids.add(pid)
        product = fetch(f"{ML_API}/products/{pid}")
        if not product:
            continue
        # Filter: only notebooks/laptops
        name = (product.get("name") or "").lower()
        laptop_kw = ["notebook", "laptop", "macbook", "ideapad", "thinkpad", "vivobook",
                     "zenbook", "inspiron", "pavilion", "omen", "legion", "rog", "aspire",
                     "envy", "spectre", "omen", "swift"]
        domain = (product.get("domain_id") or "").lower()
        if "notebook" not in domain and not any(k in name for k in laptop_kw):
            continue
        item = fetch_best_item(pid)
        laptop = product_to_laptop(product, item)
        results.append(laptop)
        print(f"  ✓ {laptop['brand']} {laptop['name'][:50]} — ${laptop['price']:,}", file=sys.stderr)
        time.sleep(0.25)

    return results


# ── Fetch laptops via products/search API ─────────────────────────────────────

def fetch_by_search(query: str, brand_filter: str = None, limit: int = 20) -> list:
    """Use products/search API (works with client_credentials unlike /sites/MLA/search)."""
    results = []
    offset = 0
    per_page = 50

    while len(results) < limit:
        url = (
            f"{ML_API}/products/search"
            f"?site_id=MLA&domain_id=MLA-NOTEBOOKS"
            f"&q={urllib.parse.quote(query)}&status=active"
            f"&limit={min(per_page, limit * 3)}&offset={offset}"
        )
        data = fetch(url)
        if not data:
            break
        page = data.get("results", []) or []
        if not page:
            break

        for p in page:
            if len(results) >= limit:
                break
            if brand_filter:
                b = ""
                for a in (p.get("attributes") or []):
                    if a.get("id", "").upper() == "BRAND":
                        b = (a.get("value_name") or "").lower()
                        break
                if brand_filter.lower() not in b:
                    continue
            results.append(p)

        total = data.get("paging", {}).get("total", 0)
        offset += len(page)
        if offset >= total or len(page) < per_page:
            break
        time.sleep(0.3)

    # Fetch full product details + best item for each
    laptops = []
    for p in results:
        pid = p.get("id")
        if not pid:
            continue
        item = fetch_best_item(pid)
        laptop = product_to_laptop(p, item)
        laptops.append(laptop)
        print(f"  ✓ {laptop['brand']} {laptop['name'][:50]} — ${laptop['price']:,}", file=sys.stderr)
        time.sleep(0.25)
    return laptops


# ── Deduplicate ────────────────────────────────────────────────────────────────

def deduplicate(laptops: list) -> list:
    seen_catalog = set()
    seen_item = set()
    out = []
    for lp in laptops:
        cid = lp.get("catalog_product_id")
        iid = lp.get("item_id")
        if cid and cid in seen_catalog:
            continue
        if iid and iid in seen_item:
            continue
        if cid:
            seen_catalog.add(cid)
        if iid:
            seen_item.add(iid)
        out.append(lp)
    return out


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="/tmp/new_laptops_scraped.json")
    args = parser.parse_args()

    # Load credentials
    env = {}
    env_path = Path(__file__).parent.parent / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()

    client_id = env.get("ML_CLIENT_ID") or os.environ.get("ML_CLIENT_ID", "")
    secret = env.get("ML_SECRET") or os.environ.get("ML_SECRET", "")
    if not client_id or not secret:
        print("Missing ML_CLIENT_ID or ML_SECRET", file=sys.stderr)
        sys.exit(1)

    global _token
    _token = get_token(client_id, secret)

    all_laptops = []

    # 1. Specific products
    print("\n── Fetching specific products ──", file=sys.stderr)
    specific = fetch_specific_products(SPECIFIC_PRODUCTS)
    all_laptops.extend(specific)
    print(f"  → {len(specific)} specific products fetched", file=sys.stderr)

    # 2. Stores (HTML scrape)
    stores_with_zero = []
    for store in STORE_LISTING_URLS:
        print(f"\n── Store: {store['name']} ──", file=sys.stderr)
        store_laptops = fetch_store_items(store)
        if not store_laptops:
            stores_with_zero.append(store["name"])
        all_laptops.extend(store_laptops)
        print(f"  → {len(store_laptops)} laptops from {store['name']}", file=sys.stderr)
        time.sleep(1)

    # 3. Fallback: products/search API for stores that returned 0
    print(f"\n── Brand searches (fallback for: {stores_with_zero}) ──", file=sys.stderr)
    for search in BRAND_SEARCHES:
        print(f"\n  Searching: {search['label']}...", file=sys.stderr)
        search_laptops = fetch_by_search(search["query"], search.get("brand_filter"), search["limit"])
        all_laptops.extend(search_laptops)
        print(f"  → {len(search_laptops)} from '{search['label']}'", file=sys.stderr)
        time.sleep(0.5)

    # 4. Filter out accessories and $0 items
    ACCESSORY_KEYWORDS = ["funda", "bolso", "mochila", "cargador", "cable", "mouse",
                          "teclado keyboard", "auricular", "monitor", "adaptador",
                          "hub usb", "soporte", "cooler", "bateria externa"]
    before_filter = len(all_laptops)
    all_laptops = [
        lp for lp in all_laptops
        if lp.get("price", 0) > 0
        and not any(kw in lp.get("name", "").lower() for kw in ACCESSORY_KEYWORDS)
    ]
    print(f"\n── Filtered out {before_filter - len(all_laptops)} accessories/$0 items ──", file=sys.stderr)

    # 5. Deduplicate
    all_laptops = deduplicate(all_laptops)
    print(f"\n── Total after dedup: {len(all_laptops)} laptops ──", file=sys.stderr)

    # 4. Group by brand
    by_brand: dict[str, list] = {}
    for lp in all_laptops:
        b = lp.get("brand") or "Unknown"
        by_brand.setdefault(b, []).append(lp)

    output = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "source": "ml_scrape_new.py",
        "total": len(all_laptops),
        "brands": sorted(by_brand.keys()),
        "laptops_by_brand": by_brand,
        "laptops_flat": all_laptops,
    }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Saved {len(all_laptops)} laptops to {args.out}", file=sys.stderr)

    # Summary
    print("\nBreakdown by brand:", file=sys.stderr)
    for b, items in sorted(by_brand.items()):
        print(f"  {b}: {len(items)}", file=sys.stderr)


if __name__ == "__main__":
    main()
