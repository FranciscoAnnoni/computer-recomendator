#!/usr/bin/env python3
"""
ml_enrich_prices.py
Reads existing ml_data/{brand}.json files and enriches each laptop with:
  - price       → from /products/{id}/items (best listing in buy-box order)
  - description → from /products/{id}.short_description
  - permalink   → https://www.mercadolibre.com.ar/p/{id}  (unchanged, already there)

Saves enriched files to ml_data_enriched/{brand}.json
and ml_data_enriched/links_with_prices.txt

Usage:
  python3 scripts/ml_enrich_prices.py --brand thinkpad       # test with one brand file
  python3 scripts/ml_enrich_prices.py                        # all brands
  python3 scripts/ml_enrich_prices.py --in-dir ml_data --out-dir ml_data_enriched
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
_token = ""


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
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 8 + attempt * 4
                print(f"  [rate-limit] waiting {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            if e.code == 404:
                return None   # product has no items
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


# ── Enrichment ────────────────────────────────────────────────────────────────

LISTING_PRIORITY = {
    "gold_pro": 5,
    "gold_special": 4,
    "gold_premium": 3,
    "gold": 2,
    "silver": 1,
}


def get_price_for_product(catalog_product_id: str):
    """
    Fetches listings for a catalog product and returns the price of
    the buy-box winner (first result, highest priority listing type).
    """
    url = f"{ML_API}/products/{catalog_product_id}/items?limit=20"
    data = fetch(url)
    if not data or not data.get("results"):
        return None

    results = data["results"]

    # Prefer higher listing type; among same type take first (buy-box order)
    best = max(
        results,
        key=lambda x: LISTING_PRIORITY.get(x.get("listing_type_id", ""), 0),
    )
    return int(best["price"]) if best.get("price") else None


def get_description_for_product(catalog_product_id: str) -> str:
    """
    Fetches catalog product detail and returns the short_description text.
    Falls back to empty string if not available.
    """
    url = f"{ML_API}/products/{catalog_product_id}"
    data = fetch(url)
    if not data:
        return ""
    sd = data.get("short_description")
    if not sd:
        return ""
    content = sd.get("content", "")
    # Trim to first 500 chars, cut at sentence boundary
    if len(content) > 500:
        cut = content[:500].rfind(".")
        if cut > 200:
            content = content[:cut + 1]
        else:
            content = content[:500].rstrip() + "..."
    return content.strip()


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    global _token

    parser = argparse.ArgumentParser()
    parser.add_argument("--client-id",  default=None)
    parser.add_argument("--secret",     default=None)
    parser.add_argument("--brand",      default="",     help="Single brand JSON file to process (e.g. 'thinkpad' or 'lenovo')")
    parser.add_argument("--in-dir",     default="ml_data",          help="Input directory (default: ml_data)")
    parser.add_argument("--out-dir",    default="ml_data_enriched",  help="Output directory (default: ml_data_enriched)")
    parser.add_argument("--skip-existing", action="store_true",      help="Skip products that already have a price")
    args = parser.parse_args()

    env = load_env()
    client_id = args.client_id or os.environ.get("ML_CLIENT_ID") or env.get("ML_CLIENT_ID")
    secret    = args.secret    or os.environ.get("ML_SECRET")    or env.get("ML_SECRET")

    if not client_id or not secret:
        print("Error: ML_CLIENT_ID and ML_SECRET required", file=sys.stderr)
        sys.exit(1)

    _token = get_token(client_id, secret)

    in_dir  = Path(args.in_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(exist_ok=True)

    # Select files to process
    if args.brand:
        # accept "thinkpad" → looks for lenovo.json; or exact filename
        brand_key = args.brand.lower().replace(" ", "_")
        candidates = list(in_dir.glob(f"{brand_key}.json"))
        if not candidates:
            candidates = list(in_dir.glob("*.json"))
            candidates = [f for f in candidates if brand_key in f.stem]
        if not candidates:
            print(f"No JSON file found for brand '{args.brand}' in {in_dir}", file=sys.stderr)
            sys.exit(1)
        files = candidates
    else:
        files = sorted(in_dir.glob("*.json"))
        # skip combined file
        files = [f for f in files if f.stem != "all_laptops"]

    if not files:
        print(f"No JSON files found in {in_dir}", file=sys.stderr)
        sys.exit(1)

    total_enriched   = 0
    total_no_price   = 0
    total_no_desc    = 0
    all_enriched     = []

    for json_file in files:
        with open(json_file, encoding="utf-8") as f:
            payload = json.load(f)

        brand   = payload.get("brand", json_file.stem)
        laptops = payload.get("laptops", [])

        print(f"\n{'─'*60}", file=sys.stderr)
        print(f"[{brand}] {len(laptops)} laptops  →  enriching prices + descriptions", file=sys.stderr)

        enriched_laptops = []

        for i, laptop in enumerate(laptops):
            pid = laptop.get("catalog_product_id", "")
            if not pid:
                enriched_laptops.append(laptop)
                continue

            # Skip if already has price and --skip-existing
            if args.skip_existing and laptop.get("price"):
                enriched_laptops.append(laptop)
                total_enriched += 1
                continue

            # ── Fetch price ────────────────────────────────────────────────
            price = get_price_for_product(pid)
            if price:
                laptop["price"] = price
                price_str = f"${price:,.0f}"
            else:
                price_str = "no price"
                total_no_price += 1

            time.sleep(0.25)

            # ── Fetch description ──────────────────────────────────────────
            desc = get_description_for_product(pid)
            if desc:
                laptop["description"] = desc
            else:
                # Auto-generate minimal description from specs
                parts = []
                if laptop.get("cpu"):    parts.append(f"Procesador {laptop['cpu']}")
                if laptop.get("ram"):    parts.append(f"{laptop['ram']} RAM")
                if laptop.get("storage"): parts.append(f"almacenamiento {laptop['storage']}")
                if laptop.get("gpu") and laptop["gpu"] != "Integrada": parts.append(f"GPU {laptop['gpu']}")
                if laptop.get("screen_size"): parts.append(f"pantalla {laptop['screen_size']}")
                if laptop.get("os"):     parts.append(laptop["os"])
                laptop["description"] = f"Notebook {laptop.get('brand', '')} {laptop.get('name', '').split()[1] if laptop.get('name') else ''}. " + ". ".join(parts) + "." if parts else ""
                total_no_desc += 1

            time.sleep(0.25)

            print(
                f"  [{i+1:>3}/{len(laptops)}] {pid}  {price_str:>14}  {laptop['name'][:45]}",
                file=sys.stderr,
            )

            enriched_laptops.append(laptop)
            total_enriched += 1

        # Save enriched brand file
        out_payload = {
            **payload,
            "generated_at": datetime.now().isoformat(),
            "enriched":     True,
            "laptops":      enriched_laptops,
        }
        out_file = out_dir / json_file.name
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(out_payload, f, ensure_ascii=False, indent=2)

        print(f"  ✓ Saved {len(enriched_laptops)} laptops → {out_file}", file=sys.stderr)
        all_enriched.extend(enriched_laptops)

    # ── Save links_with_prices.txt ────────────────────────────────────────────
    from collections import defaultdict
    by_brand = defaultdict(list)
    for laptop in all_enriched:
        by_brand[laptop.get("brand", "Unknown")].append(laptop)

    links_file = out_dir / "links_with_prices.txt"
    with open(links_file, "w", encoding="utf-8") as f:
        f.write(f"# MercadoLibre Argentina — Laptops con Precios\n")
        f.write(f"# Generado: {datetime.now().isoformat()}\n")
        f.write(f"# Total: {len(all_enriched)} laptops únicas\n")
        f.write(f"# Workflow: visitar permalink → generar link de referido → pegar en affiliate_link del JSON\n\n")

        for brand in sorted(by_brand.keys()):
            entries = by_brand[brand]
            with_price = [e for e in entries if e.get("price")]
            f.write(f"\n# ══════════════════════════════════════════════════════\n")
            f.write(f"# {brand}  ({len(entries)} laptops, {len(with_price)} con precio)\n")
            f.write(f"# ══════════════════════════════════════════════════════\n\n")

            for e in entries:
                price_str = f"${e['price']:,.0f} ARS" if e.get("price") else "precio no disponible"
                cpu   = e.get("cpu", "")  or ""
                ram   = e.get("ram", "")  or ""
                f.write(f"# {e['name'][:70]}\n")
                f.write(f"# {price_str}  |  {cpu}  |  {ram}\n")
                f.write(f"{e['permalink']}\n\n")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'═'*60}", file=sys.stderr)
    print(f"DONE", file=sys.stderr)
    print(f"  Enriched:     {total_enriched} laptops", file=sys.stderr)
    print(f"  With price:   {total_enriched - total_no_price}", file=sys.stderr)
    print(f"  No price:     {total_no_price}", file=sys.stderr)
    print(f"  Auto-desc:    {total_no_desc} (generated from specs)", file=sys.stderr)
    print(f"\nFiles:", file=sys.stderr)
    print(f"  {out_dir}/  (per-brand JSON files)", file=sys.stderr)
    print(f"  {links_file}", file=sys.stderr)
    print(f"\nNext:", file=sys.stderr)
    print(f"  python3 scripts/ml_import_db.py --dir {out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
